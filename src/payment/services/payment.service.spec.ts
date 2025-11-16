import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { MercadoPagoService } from './mercado-pago.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, ListPaymentsDto } from '../dto';
import { PaymentStatus, PaymentMethod } from '../../common/enums';
import {
  PaymentNotFoundError,
  PaymentAlreadyPaidError,
} from '../../common/exceptions/domain.exceptions';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPayment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    cpf: '12345678900',
    description: 'Test Payment',
    amount: 100.0 as any,
    paymentMethod: PaymentMethod.PIX,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Payment;

  const mockMercadoPagoPreference: MercadoPagoPreference = {
    id: 'pref_123',
    init_point: 'https://mercadopago.com/init',
    sandbox_init_point: 'https://sandbox.mercadopago.com/init',
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
  };

  const mockPaymentHistoryRepository = {
    create: jest.fn(),
    findByPaymentId: jest.fn(),
  };

  const mockMercadoPagoService = {
    createPreference: jest.fn(),
    getPreference: jest.fn(),
    getPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
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
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePaymentDto = {
      cpf: '12345678900',
      description: 'Test Payment',
      amount: 100.0,
      paymentMethod: PaymentMethod.PIX,
    };

    it('deve criar um pagamento PIX com sucesso', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: { create: mockPaymentRepository.create },
        });
      });

      mockPaymentRepository.create.mockResolvedValue(mockPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayment);
      expect(result.mercadoPago).toBeNull();
    });

    it('deve criar um pagamento com cartão de crédito e integrar com Mercado Pago', async () => {
      const creditCardDto: CreatePaymentDto = {
        ...createDto,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const creditCardPayment = {
        ...mockPayment,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: { create: mockPaymentRepository.create },
        });
      });

      mockPaymentRepository.create.mockResolvedValue(creditCardPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockMercadoPagoService.createPreference.mockResolvedValue(mockMercadoPagoPreference);

      const result = await service.create(creditCardDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(creditCardPayment);
      expect(result.mercadoPago).toEqual({
        preference_id: mockMercadoPagoPreference.id,
        init_point: mockMercadoPagoPreference.init_point,
        sandbox_init_point: mockMercadoPagoPreference.sandbox_init_point,
      });
      expect(mockMercadoPagoService.createPreference).toHaveBeenCalledWith(creditCardPayment);
    });

    it('deve lançar erro se criar pagamento com cartão e Mercado Pago falhar', async () => {
      const creditCardDto: CreatePaymentDto = {
        ...createDto,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const creditCardPayment = {
        ...mockPayment,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: { create: mockPaymentRepository.create },
        });
      });

      mockPaymentRepository.create.mockResolvedValue(creditCardPayment);
      mockPaymentHistoryRepository.create.mockResolvedValue({});
      mockMercadoPagoService.createPreference.mockRejectedValue(new Error('Mercado Pago error'));

      await expect(service.create(creditCardDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    const updateDto: UpdatePaymentDto = {
      status: PaymentStatus.PAID,
      description: 'Updated Payment',
    };

    it('deve atualizar um pagamento com sucesso', async () => {
      const updatedPayment = { ...mockPayment, ...updateDto };

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

      const result = await service.update(mockPayment.id, updateDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedPayment);
    });

    it('deve lançar PaymentNotFoundError se pagamento não existe', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: {
            findUnique: mockPaymentRepository.findById,
          },
        });
      });

      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        PaymentNotFoundError,
      );
    });

    it('deve lançar PaymentAlreadyPaidError se tentar atualizar pagamento já pago', async () => {
      const paidPayment = { ...mockPayment, status: PaymentStatus.PAID };
      const updateDto: UpdatePaymentDto = {
        amount: 200.0,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          payment: {
            findUnique: mockPaymentRepository.findById,
          },
        });
      });

      mockPaymentRepository.findById.mockResolvedValue(paidPayment);

      await expect(service.update(mockPayment.id, updateDto)).rejects.toThrow(
        PaymentAlreadyPaidError,
      );
    });
  });

  describe('findById', () => {
    it('deve retornar um pagamento por ID', async () => {
      mockPaymentRepository.findById.mockResolvedValue(mockPayment);

      const result = await service.findById(mockPayment.id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayment);
    });

    it('deve lançar PaymentNotFoundError se pagamento não existe', async () => {
      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(PaymentNotFoundError);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de pagamentos', async () => {
      const filters: ListPaymentsDto = {
        cpf: '12345678900',
        status: PaymentStatus.PENDING,
        page: 1,
        take: 10,
      };

      const mockPayments = [mockPayment];
      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const result = await service.findAll(filters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayments);
    });

    it('deve retornar lista vazia quando não há pagamentos', async () => {
      mockPaymentRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('mapMercadoPagoStatusToPaymentStatus', () => {
    it('deve mapear approved para PAID', () => {
      const result = service.mapMercadoPagoStatusToPaymentStatus('approved');
      expect(result).toBe(PaymentStatus.PAID);
    });

    it('deve mapear pending para PENDING', () => {
      const result = service.mapMercadoPagoStatusToPaymentStatus('pending');
      expect(result).toBe(PaymentStatus.PENDING);
    });

    it('deve mapear rejected para FAIL', () => {
      const result = service.mapMercadoPagoStatusToPaymentStatus('rejected');
      expect(result).toBe(PaymentStatus.FAIL);
    });

    it('deve mapear cancelled para FAIL', () => {
      const result = service.mapMercadoPagoStatusToPaymentStatus('cancelled');
      expect(result).toBe(PaymentStatus.FAIL);
    });

    it('deve retornar PENDING para status desconhecido', () => {
      const result = service.mapMercadoPagoStatusToPaymentStatus('unknown');
      expect(result).toBe(PaymentStatus.PENDING);
    });
  });
});
