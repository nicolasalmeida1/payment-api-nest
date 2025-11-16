import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PaymentMethod } from '../../common/enums';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um pagamento com sucesso', async () => {
      const createData: CreatePaymentData = {
        id: mockPayment.id,
        cpf: mockPayment.cpf,
        description: mockPayment.description,
        amount: 100.0,
        paymentMethod: mockPayment.paymentMethod,
        status: mockPayment.status,
      };

      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await repository.create(createData);

      expect(result).toEqual(mockPayment);
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('deve criar um pagamento dentro de uma transação', async () => {
      const createData: CreatePaymentData = {
        id: mockPayment.id,
        cpf: mockPayment.cpf,
        description: mockPayment.description,
        amount: 100.0,
        paymentMethod: mockPayment.paymentMethod,
        status: mockPayment.status,
      };

      const mockTx = {
        payment: {
          create: jest.fn().mockResolvedValue(mockPayment),
        },
      } as any;

      const result = await repository.create(createData, mockTx);

      expect(result).toEqual(mockPayment);
      expect(mockTx.payment.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('findById', () => {
    it('deve retornar um pagamento por ID', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await repository.findById(mockPayment.id);

      expect(result).toEqual(mockPayment);
      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayment.id },
      });
    });

    it('deve retornar null se pagamento não existe', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar um pagamento com sucesso', async () => {
      const updateData: UpdatePaymentData = {
        status: PaymentStatus.PAID,
        description: 'Updated Payment',
      };

      const updatedPayment = { ...mockPayment, ...updateData };
      mockPrismaService.payment.update.mockResolvedValue(updatedPayment);

      const result = await repository.update(mockPayment.id, updateData);

      expect(result).toEqual(updatedPayment);
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: mockPayment.id },
        data: updateData,
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de pagamentos com filtros', async () => {
      const filters: PaymentFilters = {
        cpf: '12345678900',
        status: PaymentStatus.PENDING,
        page: 1,
        take: 10,
      };

      const mockPayments = [mockPayment];
      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);

      const result = await repository.findAll(filters);

      expect(result).toEqual(mockPayments);
      expect(mockPrismaService.payment.findMany).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando não há pagamentos', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);

      const result = await repository.findAll({ page: 1, take: 10 });

      expect(result).toEqual([]);
    });
  });
});
