import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import classNames from "classnames";
import Toggle from "@/components/common/Toggle";
import Button from "@/components/common/Button";
import toast from "react-hot-toast";
import { LoanSettingsUpdateDto } from "@simpletuja/shared";

export type LoanSettingsSnapshot = LoanSettingsUpdateDto;

interface LoanSettingsFormData {
  oneWeekEnabled: boolean;
  oneWeekLTV: number;
  twoWeeksEnabled: boolean;
  twoWeeksLTV: number;
  oneMonthEnabled: boolean;
  oneMonthLTV: number;
  twoMonthsEnabled: boolean;
  twoMonthsLTV: number;
  threeMonthsEnabled: boolean;
  threeMonthsLTV: number;
  foreclosureWalletAddress: string;
}

interface LoanSettingsFormProps {
  onSubmit: (data: LoanSettingsSnapshot) => Promise<void>;
  snapshot?: LoanSettingsSnapshot;
}

const loanDurations = [
  { key: "oneWeek", label: "1 Week", recommendedLtv: 70 },
  { key: "twoWeeks", label: "2 Weeks", recommendedLtv: 65 },
  { key: "oneMonth", label: "1 Month", recommendedLtv: 60 },
  { key: "twoMonths", label: "2 Months", recommendedLtv: 50 },
  { key: "threeMonths", label: "3 Months", recommendedLtv: 40 },
] as const;

export default function LoanSettingsForm({
  onSubmit,
  snapshot,
}: LoanSettingsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanSettingsFormData>({
    defaultValues: snapshot
      ? {
          oneWeekEnabled: snapshot.oneWeekLTV !== null,
          oneWeekLTV: snapshot.oneWeekLTV ?? 70,
          twoWeeksEnabled: snapshot.twoWeeksLTV !== null,
          twoWeeksLTV: snapshot.twoWeeksLTV ?? 65,
          oneMonthEnabled: snapshot.oneMonthLTV !== null,
          oneMonthLTV: snapshot.oneMonthLTV ?? 60,
          twoMonthsEnabled: snapshot.twoMonthsLTV !== null,
          twoMonthsLTV: snapshot.twoMonthsLTV ?? 50,
          threeMonthsEnabled: snapshot.threeMonthsLTV !== null,
          threeMonthsLTV: snapshot.threeMonthsLTV ?? 40,
          foreclosureWalletAddress: snapshot.foreclosureWalletAddress ?? "",
        }
      : {
          oneWeekEnabled: false,
          oneWeekLTV: 70,
          twoWeeksEnabled: false,
          twoWeeksLTV: 65,
          oneMonthEnabled: false,
          oneMonthLTV: 60,
          twoMonthsEnabled: false,
          twoMonthsLTV: 50,
          threeMonthsEnabled: false,
          threeMonthsLTV: 40,
          foreclosureWalletAddress: "",
        },
    mode: "onSubmit",
  });

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const watchedValues = watch();

  const onSubmitHandler: SubmitHandler<LoanSettingsFormData> = async (data) => {
    // Validation: At least one Loan Duration should be enabled
    const isAnyDurationEnabled = loanDurations.some(
      ({ key }) => data[`${key}Enabled` as keyof LoanSettingsFormData]
    );

    if (!isAnyDurationEnabled) {
      toast.error("Please enable at least one Loan Duration.");
      return;
    }

    // Validation: For enabled LTVs, the value must be minimum 10
    const invalidLtv = loanDurations.find(
      ({ key }) =>
        data[`${key}Enabled` as keyof LoanSettingsFormData] &&
        (data[`${key}LTV` as keyof LoanSettingsFormData] as number) < 10
    );

    if (invalidLtv) {
      toast.error(`${invalidLtv.label} LTV must be at least 10% when enabled.`);
      return;
    }

    // Map form data to LoanSettingsSnapshot
    const snapshotData: LoanSettingsSnapshot = {
      oneWeekLTV: data.oneWeekEnabled ? data.oneWeekLTV : null,
      twoWeeksLTV: data.twoWeeksEnabled ? data.twoWeeksLTV : null,
      oneMonthLTV: data.oneMonthEnabled ? data.oneMonthLTV : null,
      twoMonthsLTV: data.twoMonthsEnabled ? data.twoMonthsLTV : null,
      threeMonthsLTV: data.threeMonthsEnabled ? data.threeMonthsLTV : null,
      foreclosureWalletAddress: data.foreclosureWalletAddress,
    };

    setIsSubmittingForm(true);
    await onSubmit(snapshotData);
  };

  const renderLtvInput = (key: string, recommendedLtv: number) => (
    <div className="flex items-center">
      <div className="relative w-24 mr-2">
        <input
          type="number"
          id={`${key}LTV`}
          {...register(`${key}LTV` as keyof LoanSettingsFormData, {
            valueAsNumber: true,
            validate: (value) => {
              if (
                watchedValues[`${key}Enabled` as keyof LoanSettingsFormData]
              ) {
                if (typeof value === "number") {
                  return (
                    (Number.isInteger(value) && value >= 10 && value <= 100) ||
                    "Value must be a whole number between 10 and 100"
                  );
                }
                return "Value must be a number";
              }
              return true;
            },
          })}
          min="10"
          max="100"
          step="1"
          className={classNames(
            "block w-full rounded-md border-0 py-1.5 pr-8 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary sm:text-sm sm:leading-6 px-2",
            {
              "bg-white dark:bg-gray-800":
                watchedValues[`${key}Enabled` as keyof LoanSettingsFormData],
              "bg-gray-100 dark:bg-gray-700":
                !watchedValues[`${key}Enabled` as keyof LoanSettingsFormData],
            }
          )}
          disabled={
            !watchedValues[`${key}Enabled` as keyof LoanSettingsFormData]
          }
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <span className="text-gray-500 sm:text-sm">%</span>
        </div>
      </div>
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
        (Recommended: {recommendedLtv}%)
      </span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="mx-auto mt-14">
      <div className="space-y-12 sm:space-y-16">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
            Loan Settings
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
            Configure your crypto lending preferences for NFT collateral loans.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Please read the descriptions under each section carefully to set
              your loan settings based on your risk tolerance. If you need help,
              our Discord community is here to assist you.{" "}
              <a href="#" className="underline decoration-dotted">
                Join our Discord server
              </a>
              .
            </p>
          </div>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 dark:border-gray-100/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 dark:divide-gray-100/10 sm:border-t sm:pb-0">
            {/* Loan Durations */}
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Loan Durations
                </label>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-500">
                  Shorter loans are usually safer for you but less appealing to
                  borrowers. Longer loans carry more risk because NFT prices can
                  change a lot over time. With longer loans, you&apos;re more
                  exposed to these price changes, which could affect the
                  loan&apos;s value.
                </p>
              </div>
              <div className="mt-4 sm:col-span-2 sm:mt-0">
                <div className="space-y-4">
                  {loanDurations.map(({ key, label }) => (
                    <div key={key} className="flex items-center">
                      <Toggle
                        className="mr-4"
                        initialChecked={Boolean(
                          watchedValues[
                            `${key}Enabled` as keyof LoanSettingsFormData
                          ]
                        )}
                        {...register(
                          `${key}Enabled` as keyof LoanSettingsFormData
                        )}
                        onChange={(checked) => {
                          setValue(
                            `${key}Enabled` as keyof LoanSettingsFormData,
                            checked
                          );
                        }}
                      />
                      <span
                        className={classNames("text-sm", {
                          "text-gray-900 dark:text-gray-100":
                            watchedValues[
                              `${key}Enabled` as keyof LoanSettingsFormData
                            ],
                          "text-gray-400 dark:text-gray-500 line-through":
                            !watchedValues[
                              `${key}Enabled` as keyof LoanSettingsFormData
                            ],
                        })}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Loan To Value (LTV) */}
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Loan To Value (LTV)
                </label>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-500">
                  LTV is the percentage of an NFT&apos;s value you&apos;re
                  willing to lend. STJ checks OpenSea for current NFT prices.
                  Lower LTV is safer but less attractive to borrowers, while
                  higher LTV is riskier but more appealing. Your choice affects
                  potential returns - balance safety and attractiveness based on
                  your risk comfort.
                </p>
              </div>
              <div className="mt-4 sm:col-span-2 sm:mt-0">
                <div className="space-y-4">
                  {loanDurations.map(({ key, label, recommendedLtv }) => (
                    <div key={key}>
                      <div className="flex items-center">
                        <span
                          className={classNames("text-sm w-24 flex-shrink-0", {
                            "text-gray-900 dark:text-gray-100":
                              watchedValues[
                                `${key}Enabled` as keyof LoanSettingsFormData
                              ],
                            "text-gray-400 dark:text-gray-500 line-through":
                              !watchedValues[
                                `${key}Enabled` as keyof LoanSettingsFormData
                              ],
                          })}
                        >
                          {label}:
                        </span>
                        {renderLtvInput(key, recommendedLtv)}
                      </div>
                      {errors[`${key}LTV` as keyof LoanSettingsFormData] && (
                        <p className="text-red-500 text-xs mt-1">
                          {
                            errors[`${key}LTV` as keyof LoanSettingsFormData]
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Foreclosed NFT Destination Wallet */}
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label
                  htmlFor="foreclosureWalletAddress"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Foreclosure Wallet Address
                </label>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-500">
                  This wallet address is where you&apos;ll receive NFTs from
                  defaulted loans. If a borrower can&apos;t repay their loan,
                  their NFT will be sent to this address. You can then sell
                  these NFTs on marketplaces like OpenSea to recover your funds.
                  Make sure to enter a wallet address you control and can access
                  easily.
                </p>
              </div>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  id="foreclosureWalletAddress"
                  {...register("foreclosureWalletAddress", {
                    required: "Foreclosure wallet address is required",
                    pattern: {
                      value: /^0x[a-fA-F0-9]{40}$/,
                      message: "Invalid Ethereum wallet address format",
                    },
                  })}
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
                  placeholder="0x0000000000000000000000000000000000000000"
                />
                {errors.foreclosureWalletAddress && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    {errors.foreclosureWalletAddress.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button type="submit" loading={isSubmittingForm}>
          Save
        </Button>
      </div>
    </form>
  );
}
