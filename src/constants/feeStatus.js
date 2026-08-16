/**
 * Enums and constants for Fee and Financial Management.
 */
export const FEE_FREQUENCY = Object.freeze({
  ONE_TIME: 'ONE_TIME',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  ANNUALLY: 'ANNUALLY',
});

export const FEE_FREQUENCY_VALUES = Object.freeze(Object.values(FEE_FREQUENCY));

export const LATE_FEE_TYPE = Object.freeze({
  NONE: 'NONE',
  FLAT: 'FLAT',
  PERCENTAGE: 'PERCENTAGE',
});

export const LATE_FEE_TYPE_VALUES = Object.freeze(Object.values(LATE_FEE_TYPE));

export const DISCOUNT_TYPE = Object.freeze({
  PERCENTAGE: 'PERCENTAGE',
  FLAT: 'FLAT',
});

export const DISCOUNT_TYPE_VALUES = Object.freeze(Object.values(DISCOUNT_TYPE));

export const INVOICE_STATUS = Object.freeze({
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  WAIVED: 'WAIVED',
  CANCELLED: 'CANCELLED',
});

export const INVOICE_STATUS_VALUES = Object.freeze(Object.values(INVOICE_STATUS));

export const PAYMENT_METHOD = Object.freeze({
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHEQUE: 'CHEQUE',
  ONLINE: 'ONLINE',
  CARD: 'CARD',
  UPI: 'UPI',
});

export const PAYMENT_METHOD_VALUES = Object.freeze(Object.values(PAYMENT_METHOD));

export const PAYMENT_STATUS = Object.freeze({
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED',
});

export const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUS));
