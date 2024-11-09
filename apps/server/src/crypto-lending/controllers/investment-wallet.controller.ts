import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  GetTokenBalanceDto,
  getTokenBalanceDtoSchema,
  WithdrawTokenRequestDto,
  withdrawTokenRequestDtoSchema,
  WithdrawTokenResponseDto,
  WithdrawTokenStatus,
} from '@simpletuja/shared';
import { AuthenticatedRequest } from '~/commons/types/auth';
import { ZodValidationPipe } from '~/commons/validations';
import { InvestmentWalletService } from '../services/investment-wallet.service';

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

  @Post('withdraw')
  async withdrawToken(
    @Req() { user }: AuthenticatedRequest,
    @Body(new ZodValidationPipe(withdrawTokenRequestDtoSchema))
    { token, amount, destinationAddress }: WithdrawTokenRequestDto,
  ): Promise<WithdrawTokenResponseDto> {
    const result = await this.investmentWalletService.withdrawToken(
      user.id,
      token,
      amount,
      destinationAddress,
    );

    return {
      status: result === true ? WithdrawTokenStatus.Success : result,
    };
  }
}
