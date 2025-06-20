import DiscordIcon from "@/components/icons/DiscordIcon";

export default function CtaSection(): JSX.Element {
  return (
    <div className="bg-gray-900 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div
          className="relative isolate overflow-hidden px-6 py-24 text-center shadow-lg sm:rounded-3xl sm:px-16"
          style={{ backgroundColor: "#131e31" }} // Custom color between gray-800 and gray-900
        >
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start Your Investment Automation Journey Today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-400">
            We&apos;re here to handle the complexities of investment management,
            so you can focus on what matters most. Set up your preferences, and
            let us do the rest. Join our Discord community to connect with
            fellow investors and provide feedback to help us enhance your
            experience.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              Get started
            </a>
            <a
              href="https://discord.gg/your-server-link"
              className="text-sm font-semibold leading-6 text-white flex items-center"
            >
              <DiscordIcon className="h-5 w-5 mr-2" />
              Join community <span aria-hidden="true">→</span>
            </a>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#f97316" /> {/* Primary color */}
                <stop offset={1} stopColor="#E935C1" />{" "}
                {/* Adjusted to match primary theme */}
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
