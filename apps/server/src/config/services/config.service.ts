import { Injectable } from '@nestjs/common';
import { Config } from '../schemas';
import { ConfigService as NestjsConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestjsConfigService<Config, true>) {}

  get<T extends keyof Config>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
