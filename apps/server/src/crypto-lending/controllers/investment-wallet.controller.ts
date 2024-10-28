import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { InvestmentWalletService } from '../services/investment-wallet.service';
import { ZodValidationPipe } from '~/commons/validations';
import {
  GetTokenBalanceDto,
  getTokenBalanceDtoSchema,
} from '@simpletuja/shared';

@Controller('crypto-lending/investment-wallet')
export class InvestmentWalletController {
  constructor(
    private readonly investmentWalletService: InvestmentWalletService,
  ) {}

  @Post('get-token-balance')
  async getTokenBalance(
    @Req() { user }: AuthenticatedRequest,
    @Body(new ZodValidationPipe(getTokenBalanceDtoSchema))
    { token }: GetTokenBalanceDto,
  ) {
    const balance = await this.investmentWalletService.getTokenBalance(
      user.id,
      token,
    );
    return balance.toString();
  }
}
