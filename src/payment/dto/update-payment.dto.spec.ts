import 'reflect-metadata';
import { validate } from 'class-validator';
import { UpdatePaymentDto } from './update-payment.dto';
import { PaymentStatus } from '../../common/enums';

describe('UpdatePaymentDto', () => {
  it('deve validar um DTO válido com status', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.PAID;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar um DTO válido com description', async () => {
    const dto = new UpdatePaymentDto();
    dto.description = 'Updated Payment';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar um DTO válido com amount', async () => {
    const dto = new UpdatePaymentDto();
    dto.amount = 200.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar um DTO com múltiplos campos', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.PAID;
    dto.description = 'Updated Payment';
    dto.amount = 200.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se status for inválido', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('deve falhar se amount for negativo', async () => {
    const dto = new UpdatePaymentDto();
    dto.amount = -10;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('deve aceitar DTO vazio (todos os campos opcionais)', async () => {
    const dto = new UpdatePaymentDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar status PENDING', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar status FAIL', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.FAIL;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
