import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import classNames from "classnames";
import { useFundAccount } from "./fund-account.context";
import Button from "@/components/common/Button";
import { CryptoToken } from "@simpletuja/shared";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

interface FundAccountFormData {
  amount: number;
  token: CryptoToken;
  startLendingRightAway: boolean;
}

interface FundAccountFormProps {
  classNames?: string;
}

export const FundAccountForm: React.FC<FundAccountFormProps> = ({
  classNames: additionalClassNames,
}) => {
  const {
    fundAccount,
    isWalletConnected,
    isConnectWalletInitiated,
    connectSenderWallet,
  } = useFundAccount();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FundAccountFormData>({
    defaultValues: {
      token: CryptoToken.WETH,
      amount: 0,
      startLendingRightAway: true,
    },
  });

  const onSubmit: SubmitHandler<FundAccountFormData> = async (data) => {
    await fundAccount(data.token, data.amount.toString());
  };

  return (
    <div
      className={classNames(
        "relative rounded-2xl overflow-hidden shadow-lg border-[1px] flex",
        additionalClassNames
      )}
    >
      <div className="relative overflow-hidden bg-primary-light w-1/2 h-min-full w-min-full flex-1">
        <img
          className="h-full w-full object-cover"
          src="https://www.sapphiresolutions.net/images/bitcoin_wallet_development/images/bitcoin_wallet_banner.svg"
          alt=""
        />
      </div>
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12 lg:px-14 lg:py-16">
        <div className="max-w-lg mx-auto">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Fund Your Account
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Deposit Tokens
          </p>
          <p className="mt-6 text-base leading-7 text-gray-300">
            Choose how much you want to put into your account. This money will
            be used to back your loans. After you fund your account and turn on
            lending, we&apos;ll automatically create loan offers for eligible
            NFTs on NFTfi.com. Remember, the more money you add, the more NFTs
            you can lend against. We recommend{" "}
            <span className="text-primary">wETH</span> token to start as it is
            the most popular.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <div className="mb-10">
              {isWalletConnected && isConnectWalletInitiated ? (
                <div className="w-full mb-4 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white bg-green-600 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Sender Wallet Connected
                </div>
              ) : (
                <Button
                  type="button"
                  className="w-full mb-4"
                  onClick={connectSenderWallet}
                >
                  1. Connect Sender Wallet
                </Button>
              )}
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300">
                Select Token
              </label>
              <div className="mt-2 flex space-x-4">
                {["wETH", "DAI", "USDC"].map((token) => (
                  <div key={token} className="flex items-center">
                    <input
                      id={token}
                      type="radio"
                      value={token}
                      {...register("token")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      defaultChecked={token === "wETH"}
                    />
                    <label
                      htmlFor={token}
                      className="ml-2 block text-sm text-gray-300"
                    >
                      {token}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300"
              >
                Amount
              </label>
              <div className="mt-1">
                <input
                  id="amount"
                  type="number"
                  step="any"
                  {...register("amount", {
                    required: "Please enter an amount",
                    min: {
                      value: 0.000000000000000001,
                      message: "Amount must be more than 0",
                    },
                    valueAsNumber: true,
                  })}
                  className="block w-full rounded-md border-gray-300 bg-white/5 py-2 px-3 text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="0.0"
                />
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div className="relative flex items-start mb-6">
              <div className="flex h-6 items-center">
                <input
                  id="startLendingRightAway"
                  type="checkbox"
                  {...register("startLendingRightAway")}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  defaultChecked={true}
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label
                  htmlFor="startLendingRightAway"
                  className="font-medium text-gray-300"
                >
                  Start lending right away
                </label>
              </div>
            </div>
            <div>
              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={!isWalletConnected || !isConnectWalletInitiated}
              >
                2. Deposit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FundAccountForm;
