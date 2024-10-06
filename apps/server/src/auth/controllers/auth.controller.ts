import {
  RegisterDtoSchema,
  ConfirmEmailDtoSchema,
  RegisterDto,
  ConfirmEmailDto,
  SignInDtoSchema,
  SignInDto,
} from '@simpletuja/shared';
import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ZodValidationPipe } from '~/commons/req-valitaions';
import { Public } from '~/commons/decorators';
import { HttpExceptionFilter } from '~/commons/filters/http-exception.filter';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(
    @Body(new ZodValidationPipe(SignInDtoSchema)) signInDto: SignInDto,
  ) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterDtoSchema)) registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Public()
  @Post('confirm-email')
  async confirmEmail(
    @Body(new ZodValidationPipe(ConfirmEmailDtoSchema))
    confirmEmailDto: ConfirmEmailDto,
  ) {
    return await this.authService.confirmEmail(confirmEmailDto.token);
  }
}
