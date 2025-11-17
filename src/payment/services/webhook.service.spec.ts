import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { MercadoPagoService } from './mercado-pago.service';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PaymentMethod } from '../../common/enums';
import { PaymentNotFoundError } from '../../common/exceptions/domain.exceptions';

describe('WebhookService', () => {
  let service: WebhookService;

  const mockPayment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    cpf: '12345678900',
    description: 'Test Payment',
    amount: 100.0 as any,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Payment;

  const mockMercadoPagoPayment: MercadoPagoPayment = {
    id: 'mp_123',
    status: 'approved',
    external_reference: mockPayment.id,
    transaction_amount: 100.0,
  };

  const mockWebhookData: MercadoPagoWebhookData = {
    action: 'payment.updated',
    data: {
      id: 'mp_123',
    },
    type: 'payment',
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  const mockPaymentRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockPaymentHistoryRepository = {
    create: jest.fn(),
  };

  const mockMercadoPagoService = {
    getPayment: jest.fn(),
  };

  const mockPaymentService = {
    mapMercadoPagoStatusToPaymentStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
        {
          provide: PaymentHistoryRepository,
          useValue: mockPaymentHistoryRepository,
        },
        {
          provide: MercadoPagoService,
          useValue: mockMercadoPagoService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processMercadoPagoWebhook', () => {
    it('should process approved payment webhook successfully', async () => {
      mockMercadoPagoService.getPayment.mockResolvedValue(mockMercadoPagoPayment);

      const updatedPayment = {
        ...mockPayment,
        status: PaymentStatus.PAID,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: {
            findUnique: mockPaymentRepository.findById,
            update: mockPaymentRepository.update,
          },
        });
      });

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);
      mockPaymentRepository.update.mockResolvedValue(updatedPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentService.mapMercadoPagoStatusToPaymentStatus.mockReturnValue(PaymentStatus.PAID);

      const result = await service.processMercadoPagoWebhook(mockWebhookData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Payment status updated successfully');
      expect(mockMercadoPagoService.getPayment).toHaveBeenCalledWith('mp_123');
    });

    it('should throw error if payment is not found', async () => {
      mockMercadoPagoService.getPayment.mockResolvedValue(mockMercadoPagoPayment);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: {
            findUnique: mockPaymentRepository.findById,
          },
        });
      });

      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(service.processMercadoPagoWebhook(mockWebhookData)).rejects.toThrow(
        PaymentNotFoundError,
      );
    });

    it('should handle webhook without external_reference', async () => {
      const paymentWithoutRef = {
        ...mockMercadoPagoPayment,
        external_reference: undefined,
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(paymentWithoutRef);

      const result = await service.processMercadoPagoWebhook(mockWebhookData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Payment missing external_reference');
    });

    it('should process rejected payment webhook', async () => {
      const rejectedPayment = {
        ...mockMercadoPagoPayment,
        status: 'rejected',
      };

      mockMercadoPagoService.getPayment.mockResolvedValue(rejectedPayment);

      const updatedPayment = {
        ...mockPayment,
        status: PaymentStatus.FAIL,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: {
            findUnique: mockPaymentRepository.findById,
            update: mockPaymentRepository.update,
          },
        });
      });

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);
      mockPaymentRepository.update.mockResolvedValue(updatedPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockPaymentService.mapMercadoPagoStatusToPaymentStatus.mockReturnValue(PaymentStatus.FAIL);

      const result = await service.processMercadoPagoWebhook(mockWebhookData);

      expect(result.success).toBe(true);
      expect(mockPaymentService.mapMercadoPagoStatusToPaymentStatus).toHaveBeenCalledWith(
        'rejected',
      );
    });

    it('should ignore webhook of type other than payment', async () => {
      const nonPaymentWebhook = {
        ...mockWebhookData,
        type: 'subscription',
      };

      const result = await service.processMercadoPagoWebhook(nonPaymentWebhook);

      expect(result.success).toBe(true);
      expect(mockMercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should handle error when fetching payment from Mercado Pago', async () => {
      mockMercadoPagoService.getPayment.mockRejectedValue(new Error('Mercado Pago API error'));

      await expect(service.processMercadoPagoWebhook(mockWebhookData)).rejects.toThrow();
    });
  });
});
