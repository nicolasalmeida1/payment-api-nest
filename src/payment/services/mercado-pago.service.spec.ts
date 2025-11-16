import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from './mercado-pago.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { PaymentMethod, PaymentStatus } from '../../common/enums';

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;

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

  const mockMercadoPagoPreference: MercadoPagoPreference = {
    id: 'pref_123',
    init_point: 'https://mercadopago.com/init',
    sandbox_init_point: 'https://sandbox.mercadopago.com/init',
  };

  const mockMercadoPagoPayment: MercadoPagoPayment = {
    id: 'mp_123',
    status: 'approved',
    external_reference: mockPayment.id,
    transaction_amount: 100.0,
  };

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

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('deve criar uma preferência de pagamento no Mercado Pago', async () => {
      mockHttpService.post.mockReturnValue(
        of({
          data: mockMercadoPagoPreference,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.createPreference(mockPayment);

      expect(result).toEqual(mockMercadoPagoPreference);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.mercadopago.com/checkout/preferences',
        expect.objectContaining({
          external_reference: mockPayment.id,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('deve lançar erro se a API do Mercado Pago falhar', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Mercado Pago API error')));

      await expect(service.createPreference(mockPayment)).rejects.toThrow();
    });
  });

  describe('getPreference', () => {
    it('deve buscar uma preferência de pagamento por ID', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: mockMercadoPagoPreference,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.getPreference('pref_123');

      expect(result).toEqual(mockMercadoPagoPreference);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.mercadopago.com/checkout/preferences/pref_123',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
          }),
        }),
      );
    });

    it('deve lançar erro se preferência não for encontrada', async () => {
      const error = new Error('Not found');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getPreference('invalid_pref')).rejects.toThrow('Not found');
    });
  });

  describe('getPayment', () => {
    it('deve buscar um pagamento por ID no Mercado Pago', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          data: mockMercadoPagoPayment,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.getPayment('mp_123');

      expect(result).toEqual(mockMercadoPagoPayment);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.mercadopago.com/v1/payments/mp_123',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
          }),
        }),
      );
    });

    it('deve lançar erro se pagamento não for encontrado', async () => {
      const error = new Error('Payment not found');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getPayment('invalid_payment')).rejects.toThrow('Payment not found');
    });
  });
});
