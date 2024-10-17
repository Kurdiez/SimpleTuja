import { Controller, Get } from '@nestjs/common';
// import NFTfi from '@nftfi/js';
import { NFT_Address } from '~/commons/constants/nft';
import { LoanContract } from '~/commons/constants/nftfi';
import { Token } from '~/commons/constants/token';
import { WalletAddress } from '~/commons/constants/wallet';
import { ConfigService } from '~/config';
// import { BigNumber, ethers } from 'ethers';

@Controller('admin/test-nftfi')
export class TestNftFiController {
  private nftfi: any;

  constructor(private readonly configService: ConfigService) {
    // const nftfiApiKey = configService.get('NFTFI_API_KEY');
    // const walletPrivateKey = configService.get('CRYPTO_ACCOUNT_PRIVATE_KEY');
    // const providerUrl = configService.get('PROVIDER_URL');
    // NFTfi.init({
    //   config: {
    //     api: { key: nftfiApiKey },
    //   },
    //   ethereum: {
    //     account: { privateKey: walletPrivateKey },
    //     provider: { url: providerUrl },
    //   },
    // }).then((result: any) => {
    //   this.nftfi = result;
    // });
  }

  @Get()
  async handleTest() {
    /**
     * Get my active offers on specific NFT collection
     */
    // const offers = await this.getOffers(
    //   NFT_Address.MyPetHooligan,
    //   WalletAddress.Jimin,
    //   LoanContract.FixedCollection_v2_3,
    // );
    // const reducedOffers = offers.map((o: any) => ({
    //   id: o.id,
    //   date: o.date,
    //   terms: o.terms,
    // }));
    // console.log('offers: ', JSON.stringify(reducedOffers));
    /**
     * Get my current WETH balance
     */
    // const balance = await this.getBalance(Token.WETH);
    // const decimals = 18;
    // const balanceStr = ethers.utils.formatUnits(balance, decimals);
    // console.log('balance: ', balanceStr.toString());
    /**
     * Get NFT listing
     */
    // const listings = await this.nftfi.listings.get({
    //   filters: {
    //     nftAddresses: [],
    //   },
    //   pagination: {
    //     limit: 20,
    //     page: 1,
    //   },
    // });
    // console.log(`[INFO] found ${listings.length} listing(s).`);
    // // Proceed if we find listings
    // if (listings.length > 0) {
    //   for (let i = 0; i < listings.length; i++) {
    //     const listing = listings[i];
    //     console.log(`[INFO] listing #${i + 1}: ${JSON.stringify(listing)} \n`);
    //   }
    // }
  }

  private async getOffers(
    nftAddress: NFT_Address,
    lenderWalletAddress: WalletAddress,
    nftfiLoanContract: LoanContract,
  ) {
    return this.nftfi.offers.get({
      filters: {
        nft: {
          address: nftAddress,
        },
        lender: {
          address: {
            eq: lenderWalletAddress,
          },
        },
        nftfi: {
          contract: {
            name: nftfiLoanContract,
          },
        },
      },
    });
  }

  private async getBalance(token: Token): Promise<string> {
    let tokenAddress: string;
    if (token === Token.WETH) {
      tokenAddress = this.nftfi.config.erc20.weth.address;
    }
    const balance = await this.nftfi.erc20.balanceOf({
      token: { address: tokenAddress },
    });

    return balance;
  }
}
