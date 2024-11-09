import { useInvestmentWallet } from "@/components/common/investment-wallet.context";
import LoadSpinner from "@/components/common/LoadSpinner";
import { Typography } from "@/components/common/Typography";
import { CryptoToken } from "@simpletuja/shared";
import { useEffect, useState } from "react";

type BalanceDisplayProps = {
  token: CryptoToken;
};

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ token }) => {
  const { tokenBalances, updateTokenBalance } = useInvestmentWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBalance = async () => {
      if (!tokenBalances[token]) {
        setIsLoading(true);
        try {
          await updateTokenBalance(token);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        setIsLoading(false);
      }
    };

    loadBalance();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <Typography.TextMD weight="medium" className="text-white">
        {token} Balance
      </Typography.TextMD>
      <dd className="mt-1 flex items-start sm:col-span-2 sm:mt-0">
        {isLoading ? (
          <LoadSpinner className="h-6 w-6" />
        ) : (
          <Typography.TextMD className="text-gray-400">
            {tokenBalances[token]} {token}
          </Typography.TextMD>
        )}
      </dd>
    </div>
  );
};
