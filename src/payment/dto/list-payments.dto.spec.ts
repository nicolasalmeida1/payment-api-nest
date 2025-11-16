import 'reflect-metadata';
import { validate } from 'class-validator';
import { ListPaymentsDto } from './list-payments.dto';
import { PaymentStatus, PaymentMethod } from '../../common/enums';

describe('ListPaymentsDto', () => {
  it('deve validar um DTO vazio (todos opcionais)', async () => {
    const dto = new ListPaymentsDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar com cpf', async () => {
    const dto = new ListPaymentsDto();
    dto.cpf = '12345678901';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar com status', async () => {
    const dto = new ListPaymentsDto();
    dto.status = PaymentStatus.PAID;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar com paymentMethod', async () => {
    const dto = new ListPaymentsDto();
    dto.paymentMethod = PaymentMethod.PIX;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar com paginação', async () => {
    const dto = new ListPaymentsDto();
    dto.page = 1;
    dto.take = 10;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar com todos os campos', async () => {
    const dto = new ListPaymentsDto();
    dto.cpf = '12345678901';
    dto.status = PaymentStatus.PAID;
    dto.paymentMethod = PaymentMethod.CREDIT_CARD;
    dto.page = 2;
    dto.take = 20;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar cpf com qualquer tamanho (filtro flexível)', async () => {
    const dto = new ListPaymentsDto();
    dto.cpf = '123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se status for inválido', async () => {
    const dto = new ListPaymentsDto();
    dto.status = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('deve falhar se paymentMethod for inválido', async () => {
    const dto = new ListPaymentsDto();
    dto.paymentMethod = 'INVALID' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('paymentMethod');
  });

  it('deve falhar se page for negativo', async () => {
    const dto = new ListPaymentsDto();
    dto.page = -1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('deve falhar se take for negativo', async () => {
    const dto = new ListPaymentsDto();
    dto.take = -10;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('take');
  });

  it('deve falhar se page for 0 (mínimo é 1)', async () => {
    const dto = new ListPaymentsDto();
    dto.page = 0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('deve aceitar valores de paginação grandes', async () => {
    const dto = new ListPaymentsDto();
    dto.page = 100;
    dto.take = 100;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
