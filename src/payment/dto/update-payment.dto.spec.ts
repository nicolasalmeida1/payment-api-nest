import 'reflect-metadata';
import { validate } from 'class-validator';
import { UpdatePaymentDto } from './update-payment.dto';
import { PaymentStatus } from '../../common/enums';

describe('UpdatePaymentDto', () => {
  it('should validate a valid DTO with status', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.PAID;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid DTO with description', async () => {
    const dto = new UpdatePaymentDto();
    dto.description = 'Updated Payment';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid DTO with amount', async () => {
    const dto = new UpdatePaymentDto();
    dto.amount = 200.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a DTO with multiple fields', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.PAID;
    dto.description = 'Updated Payment';
    dto.amount = 200.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if status is invalid', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should fail if amount is negative', async () => {
    const dto = new UpdatePaymentDto();
    dto.amount = -10;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should accept empty DTO (all fields optional)', async () => {
    const dto = new UpdatePaymentDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept PENDING status', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept FAIL status', async () => {
    const dto = new UpdatePaymentDto();
    dto.status = PaymentStatus.FAIL;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
