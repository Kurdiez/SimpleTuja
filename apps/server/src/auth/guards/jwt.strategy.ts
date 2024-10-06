import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '~/config';
import { jwtPayloadDtoSchema } from '../dto/jwt-payload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '~/database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: unknown) {
    const result = jwtPayloadDtoSchema.safeParse(payload);

    if (!result.success) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({
      where: { id: result.data.userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
