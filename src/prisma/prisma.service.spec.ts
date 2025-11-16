import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve ter método $connect', () => {
    expect(service.$connect).toBeDefined();
    expect(typeof service.$connect).toBe('function');
  });

  it('deve ter método $disconnect', () => {
    expect(service.$disconnect).toBeDefined();
    expect(typeof service.$disconnect).toBe('function');
  });

  it('deve ter método $transaction', () => {
    expect(service.$transaction).toBeDefined();
    expect(typeof service.$transaction).toBe('function');
  });

  it('deve ter model payment', () => {
    expect(service.payment).toBeDefined();
  });

  it('deve ter model paymentHistory', () => {
    expect(service.paymentHistory).toBeDefined();
  });
});
