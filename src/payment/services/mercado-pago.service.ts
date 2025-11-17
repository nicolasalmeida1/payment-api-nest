import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MercadoPagoRoutes } from '../../common/enums';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly appUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('MERCADO_PAGO_BASE_URL') || 'https://api.mercadopago.com';
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    if (!this.accessToken) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }
  }

  async createPreference(payment: Payment): Promise<MercadoPagoPreference> {
    this.logger.debug(`Creating Mercado Pago preference for payment: ${payment.id}`);

    const preferenceData = this.buildPreferenceData(payment);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}${MercadoPagoRoutes.CREATE_PREFERENCE}`,
          preferenceData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        ),
      );

      this.logger.log(`Preference created successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Mercado Pago preference', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  private buildPreferenceData(payment: Payment): MercadoPagoPreferenceData {
    this.logger.debug(`Building preference data for payment: ${payment.id}`);

    return {
      items: [
        {
          id: payment.id,
          title: payment.description,
          description: payment.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(payment.amount),
        },
      ],
      payer: {
        email: this.extractEmailFromCpf(payment.cpf),
        identification: {
          type: 'CPF',
          number: payment.cpf,
        },
      },
      back_urls: {
        success: `${this.appUrl}/api/payment/${payment.id}/success`,
        pending: `${this.appUrl}/api/payment/${payment.id}/pending`,
        failure: `${this.appUrl}/api/payment/${payment.id}/failure`,
      },
      notification_url: `${this.appUrl}/api/webhooks/mercado-pago`,
      auto_return: 'approved',
      external_reference: payment.id,
      statement_descriptor: 'PAYMENT API',
      metadata: {
        payment_id: payment.id,
        cpf: payment.cpf,
      },
    };
  }

  private extractEmailFromCpf(cpf: string): string {
    return `${cpf}@payment-api.com`;
  }

  async getPreference(preferenceId: string): Promise<any> {
    this.logger.debug(`Getting Mercado Pago preference: ${preferenceId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${MercadoPagoRoutes.GET_PREFERENCE}/${preferenceId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        }),
      );

      this.logger.debug(`Preference retrieved successfully: ${preferenceId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Mercado Pago preference', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    this.logger.debug(`Getting Mercado Pago payment: ${paymentId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${MercadoPagoRoutes.GET_PAYMENT}/${paymentId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        }),
      );

      this.logger.debug(`Payment retrieved successfully: ${paymentId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Mercado Pago payment', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }
}
