import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { MercadoPagoService } from './mercado-pago.service';
import { PaymentEvent } from '../../common/enums';
import { PaymentNotFoundError } from '../../common/exceptions/domain.exceptions';
import { PaymentService } from './payment.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentHistoryRepository: PaymentHistoryRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly paymentService: PaymentService,
  ) {}

  async processMercadoPagoWebhook(
    webhookData: MercadoPagoWebhookData,
  ): Promise<ApiWebhookResponse> {
    this.logger.debug('Processing Mercado Pago webhook', {
      action: webhookData.action,
      type: webhookData.type,
      dataId: webhookData.data?.id,
    });

    if (this.shouldIgnoreWebhook(webhookData)) {
      this.logger.log('Ignoring non-payment webhook', { type: webhookData.type });
      return {
        success: true,
        message: 'Webhook ignored - not a payment notification',
      };
    }

    const mercadoPagoPaymentId = webhookData.data.id;

    const paymentData = await this.fetchMercadoPagoPaymentData(mercadoPagoPaymentId);

    if (!paymentData) {
      return {
        success: false,
        message: 'Payment missing external_reference',
      };
    }

    const { mercadoPagoPayment, paymentId } = paymentData;

    return this.processPaymentStatusChange(paymentId, mercadoPagoPayment);
  }

  private shouldIgnoreWebhook(webhookData: MercadoPagoWebhookData): boolean {
    return webhookData.type !== 'payment';
  }

  private async fetchMercadoPagoPaymentData(mercadoPagoPaymentId: string) {
    this.logger.debug(`Fetching payment details from Mercado Pago: ${mercadoPagoPaymentId}`);

    const mercadoPagoPayment = await this.mercadoPagoService.getPayment(mercadoPagoPaymentId);

    const paymentId = mercadoPagoPayment.external_reference;

    if (!paymentId) {
      this.logger.warn('Payment missing external_reference', { mercadoPagoPaymentId });
      return null;
    }

    return { mercadoPagoPayment, paymentId };
  }

  private async processPaymentStatusChange(
    paymentId: string,
    mercadoPagoPayment: MercadoPagoPayment,
  ): Promise<ApiWebhookResponse> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const payment = await this.paymentRepository.findById(paymentId, tx);

        if (!payment) {
          throw new PaymentNotFoundError(paymentId);
        }

        const newStatus = this.paymentService.mapMercadoPagoStatusToPaymentStatus(
          mercadoPagoPayment.status,
        );

        this.logger.log('Mapped Mercado Pago status', {
          paymentId,
          mercadoPagoStatus: mercadoPagoPayment.status,
          newStatus,
          currentStatus: payment.status,
        });

        if (payment.status === newStatus) {
          this.logger.log('Payment status unchanged, skipping update', {
            paymentId,
            status: payment.status,
          });

          return {
            success: true,
            message: 'Payment status unchanged',
            data: { paymentId, status: payment.status },
          };
        }

        await this.paymentRepository.update(paymentId, { status: newStatus }, tx);

        const historyData: PaymentHistoryData = {
          payment: {
            connect: { id: paymentId },
          },
          event: PaymentEvent.PAYMENT_STATUS_CHANGED,
          eventData: {
            old_status: payment.status,
            new_status: newStatus,
            mercado_pago_status: mercadoPagoPayment.status,
            mercado_pago_payment_id: mercadoPagoPayment.id,
          },
        };

        await this.paymentHistoryRepository.create(historyData, tx);

        this.logger.log('Payment status updated successfully', {
          paymentId,
          oldStatus: payment.status,
          newStatus,
        });

        return {
          success: true,
          message: 'Payment status updated successfully',
          data: {
            paymentId,
            oldStatus: payment.status,
            newStatus,
          },
        };
      });

      return result;
    } catch (error) {
      this.logger.error('Error processing Mercado Pago webhook', error.stack);
      throw error;
    }
  }
}
