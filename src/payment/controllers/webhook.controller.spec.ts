import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from '../services/webhook.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  let webhookService: WebhookService;

  const mockWebhookData: MercadoPagoWebhookData = {
    action: 'payment.updated',
    data: {
      id: 'mp_123',
    },
    type: 'payment',
  };

  const mockWebhookService = {
    processMercadoPagoWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: WebhookService,
          useValue: mockWebhookService,
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    webhookService = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMercadoPagoWebhook', () => {
    it('should process Mercado Pago webhook successfully', async () => {
      const response: ApiWebhookResponse = {
        success: true,
        message: 'Webhook processado com sucesso',
      };

      mockWebhookService.processMercadoPagoWebhook.mockResolvedValue(response);

      const result = await controller.handleMercadoPagoWebhook(mockWebhookData);

      expect(result).toEqual(response);
      expect(webhookService.processMercadoPagoWebhook).toHaveBeenCalledWith(mockWebhookData);
    });

    it('should handle error when processing webhook', async () => {
      mockWebhookService.processMercadoPagoWebhook.mockRejectedValue(
        new Error('Webhook processing error'),
      );

      await expect(controller.handleMercadoPagoWebhook(mockWebhookData)).rejects.toThrow();
    });
  });
});
