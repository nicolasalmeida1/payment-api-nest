import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PaymentStatus } from '../../common/enums';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'status must be PENDING, PAID, or FAIL' })
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'amount must be a positive number' })
  amount?: number;
}
