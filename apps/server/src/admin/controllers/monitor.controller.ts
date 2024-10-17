import { Controller, Get } from '@nestjs/common';
import { Public } from '~/commons/decorators';

@Controller('monitor')
export class MonitorController {
  @Public()
  @Get('health')
  async getHealth() {
    return { status: 'OK' };
  }
}
