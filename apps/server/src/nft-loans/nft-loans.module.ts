import { Module } from '@nestjs/common';
import { OpenSeaService } from './services/opensea.service';

@Module({
  exports: [OpenSeaService],
  providers: [OpenSeaService],
})
export class NftLoansModule {}
