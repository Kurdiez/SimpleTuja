import { Cron } from '@nestjs/schedule';
import { captureException } from './capture-exception';
import { Logger } from '@nestjs/common';

function handleErrors(taskName: string) {
  return (
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<void>>,
  ) => {
    const originalMethod = descriptor.value;
    const logger = new Logger(taskName);

    descriptor.value = async function (...args: unknown[]) {
      logger.log('Running scheduled task: ' + taskName);
      try {
        if (originalMethod) {
          await originalMethod.apply(this, args);
        }
      } catch (error) {
        captureException({ error });
      }
      logger.log('Completed scheduled task: ' + taskName);
    };

    return descriptor;
  };
}

export function CronWithErrorHandling({
  cronTime,
  taskName,
}: {
  cronTime: string;
  taskName: string;
}) {
  return function (
    target: NonNullable<unknown>,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<void>>,
  ) {
    handleErrors(taskName)(target, propertyKey, descriptor);
    Cron(cronTime, { name: taskName, utcOffset: 0 })(
      target,
      propertyKey,
      descriptor,
    );
  };
}
