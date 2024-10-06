import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: 'never' }),
    };
  }

  async register(email: string, password: string) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const emailConfirmationToken = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24);

    const newUser = this.userRepo.create({
      email,
      password: hashedPassword,
      emailConfirmationToken,
      tokenExpiration,
    });
    await this.userRepo.save(newUser);

    console.log('Send email verification to:', email);
    console.log('Email confirmation token:', emailConfirmationToken);
  }

  async confirmEmail(
    token: string,
  ): Promise<{ success: boolean; access_token?: string }> {
    const user = await this.userRepo.findOne({
      where: { emailConfirmationToken: token },
    });
    if (user && user.tokenExpiration && user.tokenExpiration > new Date()) {
      user.isEmailConfirmed = true;
      user.emailConfirmationToken = null;
      user.tokenExpiration = null;
      await this.userRepo.save(user);

      // Generate a JWT token for the user
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload, { expiresIn: 'never' });

      return { success: true, access_token: accessToken };
    }
    throw new UnauthorizedException('Invalid or expired token');
  }
}
