import { Test, TestingModule } from '@nestjs/testing';
import { PaymentHistoryRepository } from './payment-history.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentEvent } from '../../common/enums';

describe('PaymentHistoryRepository', () => {
  let repository: PaymentHistoryRepository;

  const mockPrismaService = {
    paymentHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockPaymentHistory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    paymentId: 'payment-id-123',
    event: PaymentEvent.PAYMENT_CREATED,
    eventData: {
      cpf: '12345678900',
      amount: 100.0,
      status: 'PENDING',
    },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentHistoryRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PaymentHistoryRepository>(PaymentHistoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment history successfully', async () => {
      const createData: PaymentHistoryCreateInput = {
        payment: {
          connect: { id: 'payment-id-123' },
        },
        event: PaymentEvent.PAYMENT_CREATED,
        eventData: {
          cpf: '12345678900',
          amount: 100.0,
          status: 'PENDING',
        },
      };

      mockPrismaService.paymentHistory.create.mockResolvedValue(mockPaymentHistory);

      const result = await repository.create(createData);

      expect(result).toEqual(mockPaymentHistory);
      expect(mockPrismaService.paymentHistory.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should create a history within a transaction', async () => {
      const createData: PaymentHistoryCreateInput = {
        payment: {
          connect: { id: 'payment-id-123' },
        },
        event: PaymentEvent.PAYMENT_STATUS_CHANGED,
        eventData: {
          status: 'PAID',
        },
      };

      const mockTx = {
        paymentHistory: {
          create: jest.fn().mockResolvedValue(mockPaymentHistory),
        },
      } as any;

      const result = await repository.create(createData, mockTx);

      expect(result).toEqual(mockPaymentHistory);
      expect(mockTx.paymentHistory.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('findByPaymentId', () => {
    it('should return payment history', async () => {
      const paymentId = 'payment-id-123';
      const mockHistories = [mockPaymentHistory];

      mockPrismaService.paymentHistory.findMany.mockResolvedValue(mockHistories);

      const result = await repository.findByPaymentId(paymentId);

      expect(result).toEqual(mockHistories);
      expect(mockPrismaService.paymentHistory.findMany).toHaveBeenCalledWith({
        where: { paymentId },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should return empty array if there is no history', async () => {
      mockPrismaService.paymentHistory.findMany.mockResolvedValue([]);

      const result = await repository.findByPaymentId('non-existent-payment');

      expect(result).toEqual([]);
    });
  });
});
