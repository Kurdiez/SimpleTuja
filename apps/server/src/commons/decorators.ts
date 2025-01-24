import { SetMetadata } from '@nestjs/common';
import { Cron as NestCron } from '@nestjs/schedule';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

interface CronOptions {
  enableDev?: boolean;
}

export const Cron = (crontab: string, cronOptions?: CronOptions) => {
  return NestCron(crontab, {
    disabled: process.env.NODE_ENV === 'development' && !cronOptions?.enableDev,
  });
};
