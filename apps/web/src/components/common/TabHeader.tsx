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
  return (
    <div className="border-b border-gray-700 pb-5 sm:pb-0 mb-10">
      <Typography.DisplayXL className="mt-2 mb-8">{title}</Typography.DisplayXL>
      <div className="mt-3 sm:mt-4">
        <div className="sm:hidden">
          <label htmlFor="current-tab" className="sr-only">
            Select a tab
          </label>
          <select
            id="current-tab"
            name="current-tab"
            defaultValue={tabs.find((tab) => tab.current)?.name}
            className="block w-full rounded-md border-gray-700 bg-gray-800 py-2 pl-3 pr-10 text-gray-200 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <a
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
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
