import 'reflect-metadata';
import { validate } from 'class-validator';
import { ListPaymentsDto } from './list-payments.dto';
import { PaymentStatus, PaymentMethod } from '../../common/enums';

describe('ListPaymentsDto', () => {
  it('should validate an empty DTO (all optional)', async () => {
    const dto = new ListPaymentsDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with cpf', async () => {
    const dto = new ListPaymentsDto();
    dto.cpf = '12345678901';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with status', async () => {
    const dto = new ListPaymentsDto();
    dto.status = PaymentStatus.PAID;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with paymentMethod', async () => {
    const dto = new ListPaymentsDto();
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with pagination', async () => {
    const dto = new ListPaymentsDto();
    dto.page = 1;
    dto.take = 10;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with all fields', async () => {
    const dto = new ListPaymentsDto();
    dto.cpf = '12345678901';
    dto.status = PaymentStatus.PAID;
    dto.paymentMethod = PaymentMethod.CREDIT_CARD;
    dto.page = 2;
    dto.take = 20;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept cpf with any length (flexible filter)', async () => {
    const dto = new ListPaymentsDto();
    dto.cpf = '123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if status is invalid', async () => {
    const dto = new ListPaymentsDto();
    dto.status = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should fail if paymentMethod is invalid', async () => {
    const dto = new ListPaymentsDto();
    dto.paymentMethod = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('paymentMethod');
  });

  it('should fail if page is negative', async () => {
    const dto = new ListPaymentsDto();
    dto.page = -1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should fail if take is negative', async () => {
    const dto = new ListPaymentsDto();
    dto.take = -10;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('take');
  });

  it('should fail if page is 0 (minimum is 1)', async () => {
    const dto = new ListPaymentsDto();
    dto.page = 0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should accept large pagination values', async () => {
    const dto = new ListPaymentsDto();
    dto.page = 100;
    dto.take = 100;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
