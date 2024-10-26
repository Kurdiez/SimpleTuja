import * as Sentry from '@sentry/node';
import { addRequestDataToEvent } from '@sentry/node';
import { ExecutionContext, Logger } from '@nestjs/common';
import { CustomException, getErrorMessages } from '../errors/custom-exception';

function addCustomBreadcrumb(scope: Sentry.Scope, error: unknown) {
  if (!(error instanceof CustomException)) return;

  addCustomBreadcrumb(scope, error.cause);

  const stringifiedContext: Record<string, string> = {};
  if (error.context) {
    for (const [key, value] of Object.entries(error.context)) {
      stringifiedContext[key] = JSON.stringify(value, null, 2);
    }
  }

  scope.addBreadcrumb({
    type: 'error',
    category: 'exception',
    level: 'error',
    message: `${error.name}: ${error.message}`,
    data: stringifiedContext,
    timestamp: error.createdAt.getTime() / 1000,
  });
}

export function captureException({
  error,
  context,
  logger,
}: {
  error: unknown;
  context?: ExecutionContext; // Keep the original NestJS ExecutionContext
  logger?: Logger;
}) {
  (logger ?? console).error(
    getErrorMessages(error)
      .map((message, index) => `${index + 1}) ${message}`)
      .join('\n\n'),
  );

  // Check if the environment is development
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Only capture exception in Sentry if not in development
  if (!isDevelopment) {
    Sentry.withScope((scope) => {
      if (error instanceof CustomException) {
        addCustomBreadcrumb(scope, error.cause);
      }

      const transaction = context?.switchToHttp().getRequest();
      if (transaction) {
        scope.addEventProcessor((event) =>
          addRequestDataToEvent(event, transaction, {
            include: {
              ip: true,
              request: ['method', 'url', 'headers'],
            },
          }),
        );
      }

      Sentry.captureException(
        error,
        error instanceof CustomException ? { extra: error.context } : undefined,
      );
    });
  }
}
