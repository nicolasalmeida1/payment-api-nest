import { proxyActivities, sleep } from '@temporalio/workflow';

const activities = proxyActivities({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '1s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export async function creditCardPaymentWorkflow(paymentInput: any) {
  const { cpf, description, amount, paymentMethod } = paymentInput;

  const paymentData = {
    id: paymentInput.id || crypto.randomUUID(),
    cpf,
    description,
    amount,
    payment_method: paymentMethod,
    status: 'PENDING',
  };

  const payment = await activities.createPaymentRecord(paymentData);

  let mercadoPagoPreference;
  try {
    mercadoPagoPreference = await activities.createMercadoPagoPreference(payment);
  } catch (error) {
    await activities.updatePaymentStatus(payment.id, 'FAIL', {
      error: 'Failed to create Mercado Pago preference',
    });
    throw error;
  }

  let paymentStatus = 'PENDING';
  let attempts = 0;
  const maxAttempts = 20;
  const initialDelay = 5000;

  while (paymentStatus === 'PENDING' && attempts < maxAttempts) {
    const delay = initialDelay * Math.pow(1.5, attempts);
    await sleep(delay);

    try {
      const mercadoPagoPayment = await activities.checkPaymentStatus(payment.id);

      const mappedStatus = await activities.mapMercadoPagoStatusToPaymentStatus(
        mercadoPagoPayment.status,
      );

      if (mappedStatus !== 'PENDING') {
        await activities.updatePaymentStatus(payment.id, mappedStatus, mercadoPagoPayment);
        paymentStatus = mappedStatus;
      }
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed to check payment status:`, error.message);
    }

    attempts++;
  }

  if (paymentStatus === 'PENDING' && attempts >= maxAttempts) {
    await activities.updatePaymentStatus(payment.id, 'FAIL', {
      error: 'Payment timeout - no status update from Mercado Pago',
    });
    throw new Error('Payment processing timeout');
  }

  return {
    paymentId: payment.id,
    status: paymentStatus,
    preferenceId: mercadoPagoPreference.preference_id,
    initPoint: mercadoPagoPreference.init_point,
    sandboxInitPoint: mercadoPagoPreference.sandbox_init_point,
  };
}
