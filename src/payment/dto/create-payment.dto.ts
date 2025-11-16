import { IsString, IsNumber, IsEnum, Matches, Min, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../../common/enums';

export class CreatePaymentDto {
  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf must contain 11 numeric digits' })
  cpf: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0.01, { message: 'amount must be a positive number' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'paymentMethod must be PIX or CREDIT_CARD' })
  paymentMethod: PaymentMethod;
}
