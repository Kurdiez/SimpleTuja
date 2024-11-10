import { useGlobalStates } from "@/components/pages/app/global-states.context";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";
import React from "react";

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const userNavigation = [{ name: "Sign out", href: "#" }];

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { userHandle, setSignedOut } = useGlobalStates();

  const handleSignOut = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setSignedOut();
    window.location.href = "/";
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-gray-700 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="-m-2.5 p-2.5 text-white lg:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon aria-hidden="true" className="h-6 w-6" />
      </button>
      <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form action="#" method="GET" className="relative flex flex-1"></form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="h-6 w-6" />
          </button>
          <div
            aria-hidden="true"
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
          />
          <Menu as="div" className="relative">
            <MenuButton className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <Image
                alt=""
                src="/img/profile.png"
                width={32}
                height={32}
                className="rounded-full bg-gray-50"
              />
              <span className="hidden lg:flex lg:items-center">
                <span
                  aria-hidden="true"
                  className="ml-4 text-sm font-semibold leading-6"
                >
                  {userHandle}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="ml-2 h-5 w-5 text-gray-400"
                />
              </span>
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md border-[1px] border-whtie bg-gray-600 py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in">
              {userNavigation.map((item) => (
                <MenuItem key={item.name}>
                  <a
                    href={item.href}
                    className="block px-3 py-1 text-sm leading-6 hover:bg-gray-500"
                    onClick={
                      item.name === "Sign out" ? handleSignOut : undefined
                    }
                  >
                    {item.name}
                  </a>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;
