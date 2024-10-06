const stats = [
  { id: 1, name: "Investors on the platform", value: "2,000+" },
  { id: 2, name: "Automated actions per month", value: "50,000+" },
  { id: 3, name: "Assets under automation", value: "$15M+" },
  { id: 4, name: "Uptime guarantee", value: "99.9%" },
];

export default function StatsSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
          <h2 className="text-base font-semibold leading-8 text-primary">
            Our track record
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by thousands of investors worldwide
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            We are an automation tool that seamlessly buys, sells, and lends
            your assets on your behalf. Our platform operates on the
            world&apos;s most secure systems, integrating open-source blockchain
            protocols with fully regulated stock brokers.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col gap-y-3 border-l border-white/10 pl-6"
            >
              <dt className="text-sm leading-6">{stat.name}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
