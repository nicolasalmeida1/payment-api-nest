import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentNotFoundError extends HttpException {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`, HttpStatus.NOT_FOUND);
  }
}

export class PaymentAlreadyPaidError extends HttpException {
  constructor(paymentId: string) {
    super(`Payment already paid: ${paymentId}`, HttpStatus.BAD_REQUEST);
  }
}
