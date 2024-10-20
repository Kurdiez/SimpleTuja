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
import { GetContractAddressDto, getContractAddressDtoSchema } from './schemas';
import { ZodValidationPipe } from '~/commons/validations';
import { OpenSeaService } from '~/crypto-lending/services/opensea.service';

@Controller('admin/nft-loans/data-seed')
export class DataSeedController {
  constructor(
    private readonly dataSeedService: DataSeedService,
    private readonly openSeaService: OpenSeaService,
  ) {}

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

  @Post('seed-nft-collections')
  @UseInterceptors(FileInterceptor('file'))
  async seedNftCollections(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const nftCollections = parseNftfiLoanInfoFile(
      file.buffer.toString('utf-8'),
    );

    if (nftCollections.length) {
      await this.dataSeedService.seedNftCollections(nftCollections);
    }
  }

  @Post('get-contract-address')
  @HttpCode(200)
  async getContractAddress(
    @Body(new ZodValidationPipe(getContractAddressDtoSchema))
    { name }: GetContractAddressDto,
  ): Promise<{ contractAddress: string }> {
    const contractAddress =
      await this.dataSeedService.getNftCollectionContractAddress(name);

    return { contractAddress };
  }

  @Post('update-collection-contract-addresses')
  @HttpCode(200)
  async updateCollectionContractAddress() {
    await this.openSeaService.updateCollectionContractAddresses();
  }
}
