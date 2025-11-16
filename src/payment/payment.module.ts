import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { PaymentService } from './services/payment.service';
import { WebhookService } from './services/webhook.service';
import { MercadoPagoService } from './services/mercado-pago.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentHistoryRepository } from './repositories/payment-history.repository';

@Module({
  imports: [HttpModule],
  controllers: [PaymentController, WebhookController],
  providers: [
    PaymentService,
    WebhookService,
    MercadoPagoService,
    PaymentRepository,
    PaymentHistoryRepository,
  ],
  exports: [PaymentService, MercadoPagoService],
})
export class PaymentModule {}
