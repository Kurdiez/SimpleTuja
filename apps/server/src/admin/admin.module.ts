import { Module } from '@nestjs/common';
import { TestController } from './controllers/test.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [TestController],
})
export class AdminModule {}
