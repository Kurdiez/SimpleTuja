import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthResponse } from '@simpletuja/shared';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BrevoService } from '~/notifications/services/brevo.service';
import { UserEntity } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
    private emailService: BrevoService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  private async createAuthResponse(user: UserEntity): Promise<AuthResponse> {
    const accessToken = await this.signJwtToken(user);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    if (!user.isEmailConfirmed) {
      await this.sendEmailConfirmation(user);
      throw new UnauthorizedException(
        'Email has not been confirmed. A new confirmation email has been sent.',
      );
    }

    return this.createAuthResponse(user);
  }

  async register(email: string, password: string) {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with the same email already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = this.userRepo.create({
      email,
      password: hashedPassword,
    });
    await this.userRepo.save(newUser);

    await this.sendEmailConfirmation(newUser);
  }

  async confirmEmail(token: string): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({
      where: { emailConfirmationToken: token },
    });
    if (user) {
      user.isEmailConfirmed = true;
      user.emailConfirmationToken = null;
      await this.userRepo.save(user);

      return this.createAuthResponse(user);
    }
    throw new UnauthorizedException('Invalid token');
  }

  async refreshToken(user: UserEntity): Promise<AuthResponse> {
    return this.createAuthResponse(user);
  }

  async sendResetPasswordEmail(email: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      const resetPasswordToken = uuidv4();
      user.emailConfirmationToken = resetPasswordToken;
      await this.userRepo.save(user);

      await this.emailService.sendResetPassword(email, resetPasswordToken);
    }
    return { success: true };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Failed to reset password');
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.emailConfirmationToken = null;
    await this.userRepo.save(user);

    return this.createAuthResponse(user);
  }

  private async sendEmailConfirmation(user: UserEntity): Promise<void> {
    const emailConfirmationToken = uuidv4();
    user.emailConfirmationToken = emailConfirmationToken;
    await this.userRepo.save(user);

    await this.emailService.sendConfirmation(
      user.email,
      emailConfirmationToken,
    );
  }

  private signJwtToken(user: UserEntity): string {
    const payload = { email: user.email, userId: user.id };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }
}
