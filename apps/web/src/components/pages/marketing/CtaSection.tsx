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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-5 w-5 mr-2"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.58 0-.287-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.467-2.382 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.12 3.176.77.838 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.37.815 1.102.815 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.217.696.825.578C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
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
