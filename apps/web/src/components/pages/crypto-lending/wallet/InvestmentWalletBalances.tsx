import { Typography } from "@/components/common/Typography";
import { CryptoToken } from "@simpletuja/shared";
import { BalanceDisplay } from "./BalanceDisplay";

export const InvestmentWalletBalances: React.FC = () => {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <Typography.DisplayMD className="text-white">
          Investment Wallet Balances
        </Typography.DisplayMD>
        <Typography.TextSM className="mt-1 max-w-2xl text-gray-400">
          View your current investment wallet balances across different tokens.
        </Typography.TextSM>
      </div>

      <div className="mt-6 border-t border-white/10">
        <dl className="divide-y divide-white/10">
          <BalanceDisplay token={CryptoToken.ETH} />
          <BalanceDisplay token={CryptoToken.WETH} />
          <BalanceDisplay token={CryptoToken.DAI} />
          <BalanceDisplay token={CryptoToken.USDC} />
        </dl>
      </div>
    </div>
  );
};
