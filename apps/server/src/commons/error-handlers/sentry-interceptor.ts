import {
  Injectable,
  NestInterceptor,
  CallHandler,
  Logger,
  HttpException,
  ExecutionContext,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { captureException } from './capture-exception';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SentryInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          if (error.getStatus() >= 500) {
            captureException({
              error,
              context,
              logger: this.logger,
            });
          }
        } else {
          captureException({
            error,
            context,
            logger: this.logger,
          });
        }

        return throwError(() => error);
      }),
    );
  }
}
