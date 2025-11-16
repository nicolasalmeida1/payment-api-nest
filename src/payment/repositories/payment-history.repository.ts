import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentHistoryRepository {
  private readonly logger = new Logger(PaymentHistoryRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: PaymentHistoryCreateInput, tx?: TransactionClient): Promise<PaymentHistory> {
    this.logger.debug(`Creating payment history for payment: ${data.payment.connect.id}`);

    const client = tx || this.prisma;
    const history = await client.paymentHistory.create({ data });

    this.logger.log(`Payment history created: ${history.id}`);
    return history as PaymentHistory;
  }

  async findByPaymentId(paymentId: string): Promise<PaymentHistory[]> {
    this.logger.debug(`Finding payment history for payment: ${paymentId}`);

    const history = await this.prisma.paymentHistory.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'asc' },
    });

    this.logger.debug(`Found ${history.length} history records`);
    return history as PaymentHistory[];
  }
}
