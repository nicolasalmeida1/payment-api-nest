import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoMockService } from './mercado-pago-mock.service';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentStatus } from '../../common/enums';

describe('MercadoPagoMockService', () => {
  let service: MercadoPagoMockService;

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

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        MERCADO_PAGO_ACCESS_TOKEN: 'test_token',
        MERCADO_PAGO_BASE_URL: 'https://api.mercadopago.com',
        APP_URL: 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoMockService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MercadoPagoMockService>(MercadoPagoMockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('should create a mock payment preference', async () => {
      const result = await service.createPreference(mockPayment);

      expect(result).toBeDefined();
      expect(result.id).toBe(`pref_${mockPayment.id}`);
      expect(result.init_point).toContain('mercadopago.com.br');
      expect(result.sandbox_init_point).toContain('sandbox.mercadopago.com.br');
    });
  });

  describe('getPreference', () => {
    it('should fetch a mock payment preference by ID', async () => {
      const result = await service.getPreference('pref_123');

      expect(result).toBeDefined();
      expect(result.id).toBe('pref_123');
      expect(result.init_point).toContain('mercadopago.com.br');
      expect(result.sandbox_init_point).toContain('sandbox.mercadopago.com.br');
    });
  });

  describe('getPayment', () => {
    it('should fetch a mock payment by ID', async () => {
      const result = await service.getPayment('mp_123');

      expect(result).toBeDefined();
      expect(result.id).toBe('mp_123');
      expect(result.status).toBe('approved');
      expect(result.transaction_amount).toBe(100.0);
    });
  });
});
