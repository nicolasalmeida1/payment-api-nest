import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto, UpdatePaymentDto, ListPaymentsDto } from '../dto';
import { PaymentStatus, PaymentMethod } from '../../common/enums';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

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

  const mockPaymentService = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment successfully', async () => {
      const createDto: CreatePaymentDto = {
        cpf: '12345678900',
        description: 'Test Payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      const response: ApiPaymentResponse = {
        success: true,
        data: mockPayment,
        mercadoPago: null,
      };

      mockPaymentService.create.mockResolvedValue(response);

      const result = await controller.create(createDto);

      expect(result).toEqual(response);
      expect(paymentService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a payment successfully', async () => {
      const updateDto: UpdatePaymentDto = {
        status: PaymentStatus.PAID,
        description: 'Updated Payment',
      };

      const updatedPayment = {
        ...mockPayment,
        status: PaymentStatus.PAID,
        description: 'Updated Payment',
      } as Payment;

      const response: ApiUpdatePaymentResponse = {
        success: true,
        data: updatedPayment,
      };

      mockPaymentService.update.mockResolvedValue(response);

      const result = await controller.update(mockPayment.id, updateDto);

      expect(result).toEqual(response);
      expect(paymentService.update).toHaveBeenCalledWith(mockPayment.id, updateDto);
    });
  });

  describe('findOne', () => {
    it('should fetch a payment by ID', async () => {
      const response: ApiGetPaymentResponse = {
        success: true,
        data: mockPayment,
      };

      mockPaymentService.findById.mockResolvedValue(response);

      const result = await controller.findOne(mockPayment.id);

      expect(result).toEqual(response);
      expect(paymentService.findById).toHaveBeenCalledWith(mockPayment.id);
    });
  });

  describe('findAll', () => {
    it('should list payments with filters', async () => {
      const filters: ListPaymentsDto = {
        cpf: '12345678900',
        status: PaymentStatus.PENDING,
        page: 1,
        take: 10,
      };

      const response: ApiListPaymentsResponse = {
        success: true,
        data: [mockPayment],
      };

      mockPaymentService.findAll.mockResolvedValue(response);

      const result = await controller.findAll(filters);

      expect(result).toEqual(response);
      expect(paymentService.findAll).toHaveBeenCalledWith(filters);
    });

    it('should list all payments without filters', async () => {
      const response: ApiListPaymentsResponse = {
        success: true,
        data: [mockPayment],
      };

      mockPaymentService.findAll.mockResolvedValue(response);

      const result = await controller.findAll({});

      expect(result).toEqual(response);
      expect(paymentService.findAll).toHaveBeenCalledWith({});
    });
  });
});
