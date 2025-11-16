import { Prisma } from '@prisma/client';

declare global {
  // ============================================
  // Database Types (Prisma Generated)
  // ============================================

  type Payment = {
    id: string;
    cpf: string;
    description: string;
    amount: Prisma.Decimal;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    status: 'PENDING' | 'PAID' | 'FAIL';
    createdAt: Date;
    updatedAt: Date;
  };

  type PaymentHistory = {
    id: number;
    paymentId: string;
    event: string;
    eventData: Prisma.JsonValue | null;
    createdAt: Date;
  };

  // ============================================
  // Prisma Input Types
  // ============================================

  type PaymentCreateInput = {
    id: string;
    cpf: string;
    description: string;
    amount: number | Prisma.Decimal;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    status?: 'PENDING' | 'PAID' | 'FAIL';
    createdAt?: Date;
    updatedAt?: Date;
  };

  type PaymentUpdateInput = {
    cpf?: string;
    description?: string;
    amount?: number | Prisma.Decimal;
    paymentMethod?: 'PIX' | 'CREDIT_CARD';
    status?: 'PENDING' | 'PAID' | 'FAIL';
    updatedAt?: Date;
  };

  type PaymentWhereInput = {
    id?: string;
    cpf?: string;
    paymentMethod?: 'PIX' | 'CREDIT_CARD';
    status?: 'PENDING' | 'PAID' | 'FAIL';
  };

  type PaymentHistoryCreateInput = {
    payment: {
      connect: { id: string };
    };
    event: string;
    eventData?: any;
    createdAt?: Date;
  };

  // ============================================
  // Transaction Types
  // ============================================

  type TransactionClient = Omit<
    import('@prisma/client').PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >;

  // ============================================
  // Repository Filter Types
  // ============================================

  interface PaymentFilters {
    cpf?: string;
    paymentMethod?: string;
    status?: string;
    page?: number;
    take?: number;
  }

  // ============================================
  // Service Types
  // ============================================

  interface CreatePaymentData {
    id: string;
    cpf: string;
    description: string;
    amount: number;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    status: 'PENDING' | 'PAID' | 'FAIL';
  }

  interface UpdatePaymentData {
    status?: 'PENDING' | 'PAID' | 'FAIL';
    description?: string;
    amount?: number;
  }

  interface PaymentHistoryData {
    payment: {
      connect: { id: string };
    };
    event: string;
    eventData: any;
  }

  // ============================================
  // Mercado Pago Types
  // ============================================

  interface MercadoPagoPreference {
    id: string;
    init_point: string;
    sandbox_init_point: string;
  }

  interface MercadoPagoPayment {
    id: string;
    status: string;
    external_reference: string;
    transaction_amount: number;
  }

  interface MercadoPagoPreferenceData {
    items: Array<{
      id: string;
      title: string;
      description: string;
      quantity: number;
      currency_id: string;
      unit_price: number;
    }>;
    payer: {
      email: string;
      identification: {
        type: string;
        number: string;
      };
    };
    back_urls: {
      success: string;
      pending: string;
      failure: string;
    };
    notification_url: string;
    auto_return: string;
    external_reference: string;
    statement_descriptor: string;
    metadata: {
      payment_id: string;
      cpf: string;
    };
  }

  // ============================================
  // Response Types
  // ============================================

  interface ApiPaymentResponse {
    success: boolean;
    data: Payment;
    mercadoPago?: {
      preference_id: string;
      init_point: string;
      sandbox_init_point: string;
    } | null;
  }

  interface ApiUpdatePaymentResponse {
    success: boolean;
    data: Payment;
  }

  interface ApiGetPaymentResponse {
    success: boolean;
    data: Payment;
  }

  interface ApiListPaymentsResponse {
    success: boolean;
    data: Payment[];
  }

  interface ApiWebhookResponse {
    success: boolean;
    message: string;
    data?: any;
  }

  // ============================================
  // Webhook Types
  // ============================================

  interface MercadoPagoWebhookData {
    action: string;
    type: string;
    data: {
      id: string;
    };
  }
}

export {};
