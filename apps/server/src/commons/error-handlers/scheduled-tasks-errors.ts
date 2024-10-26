import { Cron } from '@nestjs/schedule';
import { captureException } from './capture-exception';
import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import * as dotenv from 'dotenv';

dotenv.config();

function handleErrors(taskName: string) {
  return (
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<void>>,
  ) => {
    const originalMethod = descriptor.value;
    const logger = new Logger(taskName);

    descriptor.value = async function (...args: unknown[]) {
      const runScheduledTasks = process.env.RUN_SCHEDULED_TASKS !== 'false';

      if (!runScheduledTasks) {
        logger.log(`Skipping scheduled task: ${taskName}`);
        return;
      }

      logger.log('Running scheduled task: ' + taskName);
      const startTime = performance.now();
      try {
        if (originalMethod) {
          await originalMethod.apply(this, args);
        }
      } catch (error) {
        captureException({ error });
      } finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        logger.log(
          `Completed scheduled task: ${taskName}. Duration: ${duration.toFixed(2)}ms`,
        );
      }
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
