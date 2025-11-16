import { PrismaClient } from '@prisma/client';
import { PaymentStatus, PaymentEvent } from '../../common/enums';

const prisma = new PrismaClient();

export async function createPaymentRecord(paymentData: any) {
  console.log('Creating payment record in database', { paymentId: paymentData.id });

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          id: paymentData.id,
          cpf: paymentData.cpf,
          description: paymentData.description,
          amount: paymentData.amount,
          paymentMethod: paymentData.payment_method,
          status: paymentData.status,
        },
      });

      await tx.paymentHistory.create({
        data: {
          paymentId: createdPayment.id,
          event: PaymentEvent.PAYMENT_CREATED,
          eventData: {
            cpf: paymentData.cpf,
            description: paymentData.description,
            amount: paymentData.amount.toString(),
            payment_method: paymentData.payment_method,
            status: paymentData.status,
          },
        },
      });

      return createdPayment;
    });

    console.log('Payment record created successfully', { paymentId: payment.id });
    return payment;
  } catch (error) {
    console.error('Error creating payment record', error);
    throw error;
  }
}

export async function createMercadoPagoPreference(payment: any) {
  console.log('Creating Mercado Pago preference', { paymentId: payment.id });

  const baseUrl = process.env.MERCADO_PAGO_BASE_URL || 'https://api.mercadopago.com';
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const preferenceData = {
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
      email: `${payment.cpf}@payment-api.com`,
      identification: {
        type: 'CPF',
        number: payment.cpf,
      },
    },
    back_urls: {
      success: `${appUrl}/api/payment/${payment.id}/success`,
      pending: `${appUrl}/api/payment/${payment.id}/pending`,
      failure: `${appUrl}/api/payment/${payment.id}/failure`,
    },
    notification_url: `${appUrl}/api/webhooks/mercado-pago`,
    auto_return: 'approved',
    external_reference: payment.id,
    statement_descriptor: 'PAYMENT API',
    metadata: {
      payment_id: payment.id,
      cpf: payment.cpf,
    },
  };

  try {
    const response = await fetch(`${baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Mercado Pago API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Mercado Pago preference created', { preferenceId: data.id });

    return {
      preference_id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    };
  } catch (error) {
    console.error('Error creating Mercado Pago preference', error);
    throw error;
  }
}

export async function checkPaymentStatus(mercadoPagoPaymentId: string) {
  console.log('Checking payment status on Mercado Pago', { mercadoPagoPaymentId });

  const baseUrl = process.env.MERCADO_PAGO_BASE_URL || 'https://api.mercadopago.com';
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  try {
    const response = await fetch(`${baseUrl}/v1/payments/${mercadoPagoPaymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Mercado Pago API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Payment status retrieved', {
      mercadoPagoPaymentId,
      status: data.status,
    });

    return {
      status: data.status,
      external_reference: data.external_reference,
      transaction_amount: data.transaction_amount,
    };
  } catch (error) {
    console.error('Error checking payment status', error);
    throw error;
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  newStatus: string,
  mercadoPagoData?: any,
) {
  console.log('Updating payment status', { paymentId, newStatus });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });

      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      const oldStatus = payment.status;

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: newStatus as any },
      });

      await tx.paymentHistory.create({
        data: {
          paymentId,
          event: PaymentEvent.PAYMENT_STATUS_CHANGED,
          eventData: {
            old_status: oldStatus,
            new_status: newStatus,
            mercado_pago_status: mercadoPagoData?.status,
            mercado_pago_payment_id: mercadoPagoData?.id,
          },
        },
      });

      console.log('Payment status updated successfully', {
        paymentId,
        oldStatus,
        newStatus,
      });

      return { success: true, oldStatus, newStatus };
    });

    return result;
  } catch (error) {
    console.error('Error updating payment status', error);
    throw error;
  }
}

export function mapMercadoPagoStatusToPaymentStatus(mercadoPagoStatus: string): string {
  const statusMap: Record<string, string> = {
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
