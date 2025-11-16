import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('api/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('mercado-pago')
  async handleMercadoPagoWebhook(@Body() webhookData: any) {
    return this.webhookService.processMercadoPagoWebhook(webhookData);
  }
}
