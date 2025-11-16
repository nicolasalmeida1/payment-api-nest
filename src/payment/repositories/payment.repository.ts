import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  private readonly logger = new Logger(PaymentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: PaymentCreateInput, tx?: TransactionClient): Promise<Payment> {
    this.logger.debug(`Creating payment with id: ${data.id}`);

    const client = tx || this.prisma;
    const payment = await client.payment.create({ data });

    this.logger.log(`Payment created: ${payment.id}`);
    return payment as Payment;
  }

  async findById(id: string, tx?: TransactionClient): Promise<Payment | null> {
    this.logger.debug(`Finding payment by id: ${id}`);

    const client = tx || this.prisma;
    const payment = await client.payment.findUnique({ where: { id } });

    if (payment) {
      this.logger.debug(`Payment found: ${id}`);
    } else {
      this.logger.debug(`Payment not found: ${id}`);
    }

    return payment as Payment | null;
  }

  async update(id: string, data: PaymentUpdateInput, tx?: TransactionClient): Promise<Payment> {
    this.logger.debug(`Updating payment: ${id}`);

    const client = tx || this.prisma;
    const payment = await client.payment.update({
      where: { id },
      data,
    });

    this.logger.log(`Payment updated: ${id}`);
    return payment as Payment;
  }

  async findAll(filters: PaymentFilters): Promise<Payment[]> {
    this.logger.debug('Finding payments with filters', filters);

    const { page = 1, take = 10, ...whereFilters } = filters;
    const skip = (page - 1) * take;

    const where: PaymentWhereInput = {};
    if (whereFilters.cpf) where.cpf = whereFilters.cpf;
    if (whereFilters.paymentMethod) where.paymentMethod = whereFilters.paymentMethod as any;
    if (whereFilters.status) where.status = whereFilters.status as any;

    const payments = await this.prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    this.logger.debug(`Found ${payments.length} payments`);
    return payments as Payment[];
  }
}
