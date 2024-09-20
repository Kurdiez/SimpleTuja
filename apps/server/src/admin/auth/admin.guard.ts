import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.path.startsWith('/admin')) {
      return true;
    }

    const secretHeader = request.headers['x-admin-secret'];

    if (secretHeader !== this.configService.get('ADMIN_SECRET')) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    return true;
  }
}
