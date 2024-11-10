import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Image from "next/image";
import { Fragment } from "react";

const tabs = [
  {
    name: "Crypto P2P Lending",
    features: [
      {
        name: "Find The Right NFTs",
        description:
          "Analyze NFTfi and OpenSea to find active NFT collections.",
      },
      {
        name: "Risk Management",
        description: "Set loan principal based on top bid averages on OpenSea.",
      },
      {
        name: "Interest Rates",
        description:
          "Get competitive rates from NFTfi for your NFT collection.",
      },
      {
        name: "Loan Offer Renewals",
        description:
          "Renew offers daily to manage NFT and crypto price volatility.",
      },
    ],
    imageUrl: "/nftfi.jpg",
  },
  // {
  //   name: "Stocks Balancing Pies",
  //   features: [
  //     {
  //       name: "Create Your Own Pie",
  //       description: "Build a pie with only the stocks you choose.",
  //     },
  //     {
  //       name: "Set the Size of Each Slice",
  //       description: "Decide how much to allocate to each slice.",
  //     },
  //     {
  //       name: "Set the Rebalance Trigger",
  //       description: "Choose when rebalancing should occur.",
  //     },
  //     {
  //       name: "Automated Rebalancing",
  //       description: "Our system automatically rebalances your portfolio.",
  //     },
  //   ],
  //   imageUrl: "/construction.jpg",
  // },
];

export default function FeaturesSection() {
  return (
    <div id="features">
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-7xl py-32 sm:px-2 lg:px-8"
      >
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
          <div className="max-w-3xl">
            <h2
              id="features-heading"
              className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
            >
              Features
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-300">
              Discover how our automation tools streamline your investment
              management, making it effortless to handle diverse financial
              tasks.
            </p>
          </div>

          <TabGroup className="mt-4">
            <div className="-mx-4 flex overflow-x-auto sm:mx-0">
              <div className="flex-auto border-b border-gray-200 dark:border-gray-700 px-4 sm:px-0">
                <TabList className="-mb-px flex space-x-10">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium text-gray-500 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:text-primary data-[selected]:border-primary data-[selected]:text-primary dark:data-[selected]:text-primary focus:outline-none" // Added focus:outline-none
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
            </div>

            <TabPanels as={Fragment}>
              {tabs.map((tab) => (
                <TabPanel key={tab.name} className="space-y-16 pt-10 lg:pt-16">
                  <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="mt-6 lg:col-span-5 lg:mt-0">
                      {tab.features.map((feature) => (
                        <div key={feature.name} className="mb-6">
                          <h3 className="text-lg font-medium text-primary-light">
                            {feature.name}
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="lg:col-span-7">
                      <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Image
                          alt={tab.name}
                          src={tab.imageUrl}
                          width={1600}
                          height={300}
                          className="object-cover w-full"
                          style={{ height: "300px" }}
                        />
                      </div>
                    </div>
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </section>
    </div>
  );
}
