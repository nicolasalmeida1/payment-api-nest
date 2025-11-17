import {
  PaymentNotFoundError,
  PaymentAlreadyPaidError,
} from './domain.exceptions';

describe('Domain Exceptions', () => {
  describe('PaymentNotFoundError', () => {
    it('should create exception with correct message', () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new PaymentNotFoundError(paymentId);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('PaymentNotFoundError');
      expect(error.message).toBe(`Payment not found: ${paymentId}`);
    });

    it('should have stack trace', () => {
      const error = new PaymentNotFoundError('test-id');

      expect(error.stack).toBeDefined();
    };
  });

  describe('PaymentAlreadyPaidError', () => {
    it('should create exception with correct message', () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new PaymentAlreadyPaidError(paymentId);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('PaymentAlreadyPaidError');
      expect(error.message).toBe(`Payment already paid: ${paymentId}`);
    });

    it('should have stack trace', () => {
      const error = new PaymentAlreadyPaidError('test-id');

      expect(error.stack).toBeDefined();
    });
  });
});
