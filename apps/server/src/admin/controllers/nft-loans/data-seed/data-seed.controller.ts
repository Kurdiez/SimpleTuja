import {
  Controller,
  Post,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
} from '@nestjs/common';
import { DataSeedService } from '../../../services/data-seed.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { parseNftfiLoanInfoFile } from '../../../utils/nftfi-loan-info-file-parser';
import { ZodValidationPipe } from '~/commons/req-valitaions';
import { GetContractAddressDto, getContractAddressDtoSchema } from './schemas';

@Controller('admin/nft-loans/data-seed')
export class DataSeedController {
  constructor(private readonly dataSeedService: DataSeedService) {}

  @Post('count-num-nfts')
  @UseInterceptors(FileInterceptor('file'))
  async countNumNfts(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const nftCollections = parseNftfiLoanInfoFile(
      file.buffer.toString('utf-8'),
    );
    return nftCollections.length;
  }

  @Post('init-nft-collections')
  @UseInterceptors(FileInterceptor('file'))
  async initNftCollections(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const nftCollections = parseNftfiLoanInfoFile(
      file.buffer.toString('utf-8'),
    );

    if (nftCollections.length) {
      await this.dataSeedService.initNftCollections(nftCollections);
    }
  }

  @Post('get-contract-address')
  @HttpCode(200)
  async getContractAddress(
    @Body(new ZodValidationPipe(getContractAddressDtoSchema))
    { name }: GetContractAddressDto,
  ) {
    const contractAddress =
      await this.dataSeedService.getNftCollectionContractAddress(name);

    return { contractAddress };
  }
}
