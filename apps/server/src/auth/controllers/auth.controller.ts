import { Body, Controller, Post, Req, UseFilters } from '@nestjs/common';
import {
  AuthResponse,
  ConfirmEmailDto,
  ConfirmEmailDtoSchema,
  RegisterDto,
  RegisterDtoSchema,
  ResetPasswordDto,
  ResetPasswordDtoSchema,
  SendResetPasswordEmailDto,
  SendResetPasswordEmailDtoSchema,
  SignInDto,
  SignInDtoSchema,
} from '@simpletuja/shared';
import { Public } from '~/commons/decorators';
import { HttpExceptionFilter } from '~/commons/filters/http-exception.filter';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { ZodValidationPipe } from '~/commons/validations';
import { AuthService } from '../service/auth.service';

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
  ): Promise<AuthResponse> {
    return await this.authService.confirmEmail(confirmEmailDto.token);
  }

  @Post('sign-in-with-token')
  async signInWithToken(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.refreshToken(user);
  }

  @Public()
  @Post('send-reset-password-email')
  async sendResetPasswordEmail(
    @Body(new ZodValidationPipe(SendResetPasswordEmailDtoSchema))
    sendResetPasswordEmailDto: SendResetPasswordEmailDto,
  ) {
    return this.authService.sendResetPasswordEmail(
      sendResetPasswordEmailDto.email,
    );
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordDtoSchema))
    resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
