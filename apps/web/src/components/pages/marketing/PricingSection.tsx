import { CheckIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

const includedFeatures = [
  "All investment assets now and in the future",
  "Full functionalities on all the features",
  "Unlimited usage quotas on all features",
  "Priority support",
];

export default function PricingSection() {
  return (
    <div className="py-24 sm:py-32 bg-gray-900 dark:bg-gray-900" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
            Simple, No-Tricks Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Start with a{" "}
            <span className="text-primary-light">free account</span> to explore
            our features with limited functionalities. When you&apos;re ready,
            upgrade to a full subscription to unlock all features and updates.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-700 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-100">
              Monthly Subscription
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-400">
              Unlock the full potential of automated investment management with
              our comprehensive tools for crypto, stocks, and more to come in
              the future.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-primary">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-700" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-300 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-primary"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-800 py-10 text-center ring-1 ring-inset ring-gray-700 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-300">
                  Subscribe monthly
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-100 line-through opacity-50">
                    $10
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-300 line-through opacity-50">
                    USD / month
                  </span>
                </p>
                <p className="mt-2 text-sm font-semibold text-primary-light">
                  Free during Beta
                </p>
                <Link
                  href="/sign-in"
                  className="mt-8 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
                >
                  Start Free Now
                </Link>
                <p className="mt-6 text-xs leading-5 text-gray-300">
                  Sign in to try the app for free first and upgrade later within
                  the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
