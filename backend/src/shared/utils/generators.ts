import { ORDER_NUMBER_PREFIX, BATCH_NUMBER_PREFIX } from '../../config/constants';

/**
 * Generate unique order number
 * @returns Order number string
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${ORDER_NUMBER_PREFIX}-${timestamp}-${random}`;
};

/**
 * Generate unique batch number
 * @returns Batch number string
 */
export const generateBatchNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${BATCH_NUMBER_PREFIX}-${timestamp}-${random}`;
};

/**
 * Generate transaction reference for payments
 * @returns Transaction reference string
 */
export const generateTransactionRef = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};
