import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { MercadoPagoService } from './mercado-pago.service';
import { CreatePaymentDto, UpdatePaymentDto, ListPaymentsDto } from '../dto';
import { PaymentStatus, PaymentEvent, PaymentMethod } from '../../common/enums';
import {
  PaymentNotFoundError,
  PaymentAlreadyPaidError,
} from '../../common/exceptions/domain.exceptions';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentHistoryRepository: PaymentHistoryRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<ApiPaymentResponse> {
    const paymentId = randomUUID();

    this.logger.log(`Creating payment: ${paymentId}`, {
      cpf: createPaymentDto.cpf,
      amount: createPaymentDto.amount,
      paymentMethod: createPaymentDto.paymentMethod,
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const paymentData: CreatePaymentData = {
          id: paymentId,
          cpf: createPaymentDto.cpf,
          description: createPaymentDto.description,
          amount: createPaymentDto.amount,
          paymentMethod: createPaymentDto.paymentMethod,
          status: PaymentStatus.PENDING,
        };

        const payment = await this.paymentRepository.create(paymentData, tx);

        const historyData: PaymentHistoryData = {
          payment: {
            connect: { id: payment.id },
          },
          event: PaymentEvent.PAYMENT_CREATED,
          eventData: {
            cpf: createPaymentDto.cpf,
            description: createPaymentDto.description,
            amount: createPaymentDto.amount,
            paymentMethod: createPaymentDto.paymentMethod,
            status: PaymentStatus.PENDING,
          },
        };

        await this.paymentHistoryRepository.create(historyData, tx);

        return payment;
      });

      this.logger.log(`Payment created successfully: ${result.id}`);

      let mercadoPagoData = null;

      if (createPaymentDto.paymentMethod === PaymentMethod.CREDIT_CARD) {
        mercadoPagoData = await this.processCreditCardPayment(result);
      }

      return {
        success: true,
        data: result,
        mercadoPago: mercadoPagoData,
      };
    } catch (error) {
      this.logger.error(`Error creating payment: ${paymentId}`, error.stack);
      throw error;
    }
  }

  private async processCreditCardPayment(payment: Payment) {
    this.logger.log(`Processing credit card payment: ${payment.id}`);

    try {
      const mercadoPagoPreference = await this.mercadoPagoService.createPreference(payment);

      return {
        preference_id: mercadoPagoPreference.id,
        init_point: mercadoPagoPreference.init_point,
        sandbox_init_point: mercadoPagoPreference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error(`Error creating Mercado Pago preference: ${payment.id}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<ApiUpdatePaymentResponse> {
    this.logger.log(`Updating payment: ${id}`, updatePaymentDto);

    try {
      const existingPayment = await this.paymentRepository.findById(id);

      if (!existingPayment) {
        this.logger.warn(`Payment not found: ${id}`);
        throw new PaymentNotFoundError(id);
      }

      if (existingPayment.status === PaymentStatus.PAID) {
        this.logger.warn(`Attempt to update paid payment: ${id}`);
        throw new PaymentAlreadyPaidError(id);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updateData: UpdatePaymentData = {};
        if (updatePaymentDto.status) updateData.status = updatePaymentDto.status;
        if (updatePaymentDto.description) updateData.description = updatePaymentDto.description;
        if (updatePaymentDto.amount) updateData.amount = updatePaymentDto.amount;

        const updatedPayment = await this.paymentRepository.update(id, updateData, tx);

        if (updatePaymentDto.status && updatePaymentDto.status !== existingPayment.status) {
          this.logger.debug(`Status changed, creating history entry: ${id}`);

          const historyData: PaymentHistoryData = {
            payment: {
              connect: { id },
            },
            event: PaymentEvent.PAYMENT_STATUS_CHANGED,
            eventData: {
              old_status: existingPayment.status,
              new_status: updatePaymentDto.status,
            },
          };

          await this.paymentHistoryRepository.create(historyData, tx);
        }

        return updatedPayment;
      });

      this.logger.log(`Payment updated successfully: ${id}`);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error updating payment: ${id}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<ApiGetPaymentResponse> {
    this.logger.debug(`Finding payment by id: ${id}`);

    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      this.logger.warn(`Payment not found: ${id}`);
      throw new PaymentNotFoundError(id);
    }

    return {
      success: true,
      data: payment,
    };
  }

  async findAll(filters: ListPaymentsDto): Promise<ApiListPaymentsResponse> {
    this.logger.debug('Finding payments with filters', filters);

    const payments = await this.paymentRepository.findAll(filters);

    return {
      success: true,
      data: payments,
    };
  }

  mapMercadoPagoStatusToPaymentStatus(mercadoPagoStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      approved: PaymentStatus.PAID,
      rejected: PaymentStatus.FAIL,
      cancelled: PaymentStatus.FAIL,
      refunded: PaymentStatus.FAIL,
      charged_back: PaymentStatus.FAIL,
      pending: PaymentStatus.PENDING,
      in_process: PaymentStatus.PENDING,
      in_mediation: PaymentStatus.PENDING,
      authorized: PaymentStatus.PENDING,
    };

    return statusMap[mercadoPagoStatus] || PaymentStatus.PENDING;
  }
}
