import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentMethod } from '../../common/enums';

describe('CreatePaymentDto', () => {
  it('deve validar um DTO válido', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se cpf estiver vazio', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('deve falhar se cpf não tiver 11 dígitos', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '123';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cpf');
  });

  it('deve falhar se description estiver vazio', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = '';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });

  it('deve falhar se amount for negativo', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = -10;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('deve falhar se amount for zero', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 0;
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('deve falhar se paymentMethod for inválido', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('paymentMethod');
  });

  it('deve aceitar pagamento com cartão de crédito', async () => {
    const dto = new CreatePaymentDto();
    dto.cpf = '12345678901';
    dto.description = 'Test Payment';
    dto.amount = 100.5;
    dto.paymentMethod = PaymentMethod.CREDIT_CARD;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
