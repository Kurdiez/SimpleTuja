import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '~/commons/validations';
import { BrevoService } from '~/notifications/services/brevo.service';
import {
  TestNftLiquidationAlertReq,
  testNftLiquidationAlertReqSchema,
} from './test-brevo.schema';

@Controller('admin/test-brevo')
export class TestBrevoController {
  constructor(private readonly brevoService: BrevoService) {}

  @Post('test-nft-liquidation-alert')
  async testNftLiquidationAlert(
    @Body(new ZodValidationPipe(testNftLiquidationAlertReqSchema))
    {
      toEmail,
      foreclosureWalletAddress,
      nftCollectionName,
      nftTokenId,
    }: TestNftLiquidationAlertReq,
  ): Promise<void> {
    await this.brevoService.sendNftLiquidationAlert(
      toEmail,
      foreclosureWalletAddress,
      nftCollectionName,
      nftTokenId,
    );
  }
}
