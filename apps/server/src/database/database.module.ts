import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entitiesToReigster } from './entities-registry';

@Module({
  imports: [TypeOrmModule.forFeature(entitiesToReigster)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
