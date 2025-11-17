import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MercadoPagoMockService {
  private readonly logger = new Logger(MercadoPagoMockService.name);
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('MERCADO_PAGO_BASE_URL') || 'https://api.mercadopago.com';
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    if (!this.accessToken) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }
  }

  async createPreference(payment: Payment): Promise<MercadoPagoPreference> {
    this.logger.debug(`[MOCK] Creating Mercado Pago preference for payment: ${payment.id}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const mockPreference: MercadoPagoPreference = {
      id: `pref_${payment.id}`,
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_${payment.id}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=pref_${payment.id}`,
    };

    this.logger.log(`[MOCK] Preference created successfully: ${mockPreference.id}`);
    return mockPreference;
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
    this.logger.debug(`[MOCK] Getting Mercado Pago preference: ${preferenceId}`);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const mockPreference = {
      id: preferenceId,
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
    };

    this.logger.debug(`[MOCK] Preference retrieved successfully: ${preferenceId}`);
    return mockPreference;
  }

  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    this.logger.debug(`[MOCK] Getting Mercado Pago payment: ${paymentId}`);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const mockPayment: MercadoPagoPayment = {
      id: paymentId,
      status: 'approved',
      external_reference: paymentId,
      transaction_amount: 100.0,
    };

    this.logger.debug(`[MOCK] Payment retrieved successfully: ${paymentId}`);
    return mockPayment;
  }
}
