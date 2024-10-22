import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  factor?: number;
  retryableErrors?: Array<new (...args: any[]) => Error>;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelay: 1000,
  factor: 2,
  retryableErrors: undefined,
};

export async function retry<T>(
  operation: () => Promise<T>,
  logger?: Logger,
  options?: RetryOptions,
): Promise<T> {
  const { maxRetries, initialDelay, factor, retryableErrors } = {
    ...DEFAULT_OPTIONS,
    ...(options ?? {}),
  };

  let retryCount = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;

      // if retry count is greater than max retries or the error is not in the retryable errors array, throw the error
      if (
        retryCount > maxRetries ||
        (retryableErrors &&
          !retryableErrors.some((errorType) => error instanceof errorType))
      ) {
        throw error;
      }

      if (logger) {
        logger.warn(
          `Retry attempt ${retryCount} failed. Retrying in ${
            delay / 1000
          } seconds.`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= factor;
    }
  }
}
