import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";

const steps = [
  {
    name: "Setup Investment Accounts",
    description:
      "Ensure your investment accounts are properly configured with external platforms, granting us the necessary permissions to automate your investments.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Fine Tune",
    description:
      "While our features come with comprehensive automation algorithms, we make it easy for you to adjust and fine-tune settings to match your risk preferences.",
    icon: LockClosedIcon,
  },
  {
    name: "Monitor Performances",
    description:
      "Utilize our dashboard and automated alerts to gain a complete overview of your investment performance.",
    icon: ServerIcon,
  },
];

export default function HowItWorksSection() {
  return (
    <div className="py-24 sm:py-32" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pl-4 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-primary">
                3 Easy Steps
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
                How It Works
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                We aim to make your investment journey as seamless as possible.
                That&apos;s why we&apos;ve distilled our process into three
                simple steps for all our features.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
                {steps.map((step, index) => (
                  <div key={step.name} className="relative pl-9">
                    <dt className="inline font-semibold text-primary-light">
                      <span
                        aria-hidden="true"
                        className="absolute left-1 top-1 h-5 w-5 text-primary"
                      >
                        {index + 1}.
                      </span>
                      {step.name}
                    </dt>{" "}
                    <dd className="inline">{step.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex items-start justify-end lg:order-first">
            <Image
              alt="Product screenshot"
              src="/img/app-placeholder.png"
              width={2432}
              height={1442}
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
