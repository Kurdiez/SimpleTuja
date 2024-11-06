import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { Typography } from "./Typography";

interface Tab {
  name: string;
  href: string;
  current: boolean;
}

interface TabHeaderProps {
  title: string;
  tabs: Tab[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const TabHeader: FC<TabHeaderProps> = ({ title, tabs }) => {
  const router = useRouter();

  const handleTabChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTab = tabs.find((tab) => tab.name === event.target.value);
    if (selectedTab) {
      router.push(selectedTab.href);
    }
  };

  return (
    <div className="border-b border-gray-700 pb-5 sm:pb-0 mb-10">
      <Typography.DisplayXL className="mt-2 mb-8">{title}</Typography.DisplayXL>
      <div className="mt-3 sm:mt-4">
        <div className="sm:hidden relative">
          <label htmlFor="current-tab" className="sr-only">
            Select a tab
          </label>
          <select
            id="current-tab"
            name="current-tab"
            value={tabs.find((tab) => tab.current)?.name}
            onChange={handleTabChange}
            className="block w-full rounded-md border-gray-700 bg-gray-800 py-2 pl-3 pr-8 text-gray-200 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm appearance-none"
          >
            {tabs.map((tab) => (
              <option key={tab.name} value={tab.name}>
                {tab.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? "page" : undefined}
                className={classNames(
                  tab.current
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300",
                  "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium"
                )}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
