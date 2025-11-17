import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentMethod } from '../../common/enums';

describe('CreatePaymentDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if cpf is empty', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('should fail if cpf does not have 11 digits', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '123';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('should fail if description is empty', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = '';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });

  it('should fail if amount is negative', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = -10;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail if amount is zero', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 0;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail if paymentMethod is invalid', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('paymentMethod');
  });

  it('should accept credit card payment', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.CREDIT_CARD;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
