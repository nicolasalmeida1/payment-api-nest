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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have $connect method', () => {
    expect(service.$connect).toBeDefined();
    expect(typeof service.$connect).toBe('function');
  });

  it('should have $disconnect method', () => {
    expect(service.$disconnect).toBeDefined();
    expect(typeof service.$disconnect).toBe('function');
  });

  it('should have $transaction method', () => {
    expect(service.$transaction).toBeDefined();
    expect(typeof service.$transaction).toBe('function');
  });

  it('should have payment model', () => {
    expect(service.payment).toBeDefined();
  });

  it('should have paymentHistory model', () => {
    expect(service.paymentHistory).toBeDefined();
  });
});
