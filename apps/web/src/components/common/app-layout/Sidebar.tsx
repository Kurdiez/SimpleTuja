import { useCryptoLending } from "@/components/pages/crypto-lending/crypto-lending.context";
import { AppRoute } from "@/utils/app-route";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TransitionChild,
} from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { CircleStackIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useMemo } from "react";
import Logo from "../Logo";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openSections: string[];
  setOpenSections: React.Dispatch<React.SetStateAction<string[]>>;
}

const getNavigation = (isOnboardingComplete: boolean) => [
  {
    name: "Crypto Lending",
    href: AppRoute.CryptoLending,
    icon: CircleStackIcon,
    children: isOnboardingComplete
      ? [
          { name: "Dashboard", href: AppRoute.CryptoLending },
          { name: "About", href: AppRoute.CryptoLendingAbout },
          { name: "Wallet", href: AppRoute.CryptoLendingWallet },
          { name: "Settings", href: AppRoute.CryptoLendingSettings },
        ]
      : [
          { name: "Onboarding", href: AppRoute.CryptoLendingOnboarding },
          { name: "About", href: AppRoute.CryptoLendingOnboardingAbout },
        ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  openSections,
  setOpenSections,
}) => {
  const router = useRouter();
  const { isOnboardingComplete } = useCryptoLending();
  const navigation = useMemo(
    () => getNavigation(isOnboardingComplete),
    [isOnboardingComplete]
  );

  const isCurrentRoute = useCallback(
    (href: string, isParent?: boolean): boolean => {
      if (isParent) {
        return router.pathname === href && href !== AppRoute.CryptoLending;
      }
      return router.pathname === href;
    },
    [router]
  );

  const handleNavClick = useCallback(
    (href: string, e: React.MouseEvent) => {
      if (isCurrentRoute(href)) {
        e.preventDefault();
        return;
      }

      if (sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    [isCurrentRoute, sidebarOpen, setSidebarOpen]
  );

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      if (isCurrentRoute(AppRoute.CryptoLending)) {
        e.preventDefault();
        return;
      }
    },
    [isCurrentRoute]
  );

  const toggleSection = useCallback(
    (sectionName: string) => {
      setOpenSections((prev) =>
        prev.includes(sectionName)
          ? prev.filter((name) => name !== sectionName)
          : [...prev, sectionName]
      );
    },
    [setOpenSections]
  );

  return (
    <>
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full">
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon
                    aria-hidden="true"
                    className="h-6 w-6 text-white"
                  />
                </button>
              </div>
            </TransitionChild>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 py-4 ring-1 ring-white/10">
              <div className="flex h-16 shrink-0 items-center justify-center">
                <Link
                  href={AppRoute.CryptoLending}
                  onClick={handleLogoClick}
                  className="cursor-pointer select-none"
                >
                  <Logo />
                </Link>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Disclosure
                            as="div"
                            defaultOpen={openSections.includes(item.name)}
                            onChange={() => toggleSection(item.name)}
                          >
                            <DisclosureButton
                              className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                                isCurrentRoute(item.href, true)
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              } cursor-pointer`}
                            >
                              <item.icon
                                aria-hidden="true"
                                className="h-6 w-6 shrink-0"
                              />
                              <span className="flex-1 text-left">
                                {item.name}
                              </span>
                              <ChevronRightIcon
                                aria-hidden="true"
                                className="h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90"
                              />
                            </DisclosureButton>
                            <DisclosurePanel as="ul" className="mt-1 space-y-1">
                              {item.children.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    href={subItem.href}
                                    onClick={(e) =>
                                      handleNavClick(subItem.href, e)
                                    }
                                    className={`block rounded-md py-2 pl-11 pr-2 text-sm ${
                                      isCurrentRoute(subItem.href)
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </DisclosurePanel>
                          </Disclosure>
                        </li>
                      ))}
                    </ul>
                  </li>
                  {/* <li className="mt-auto">
                    <Link
                      href={AppRoute.Settings}
                      className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer"
                    >
                      <Cog6ToothIcon
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0"
                      />
                      Settings
                    </Link>
                  </li> */}
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 py-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <Link
              href={AppRoute.CryptoLending}
              onClick={handleLogoClick}
              className="cursor-pointer select-none"
            >
              <Logo />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Disclosure
                        as="div"
                        defaultOpen={openSections.includes(item.name)}
                        onChange={() => toggleSection(item.name)}
                      >
                        <DisclosureButton
                          className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                            isCurrentRoute(item.href, true)
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          } cursor-pointer`}
                        >
                          <item.icon
                            aria-hidden="true"
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="flex-1 text-left">{item.name}</span>
                          <ChevronRightIcon
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90"
                          />
                        </DisclosureButton>
                        <DisclosurePanel as="ul" className="mt-1 space-y-1">
                          {item.children.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                onClick={(e) => handleNavClick(subItem.href, e)}
                                className={`block rounded-md py-2 pl-11 pr-2 text-sm ${
                                  isCurrentRoute(subItem.href)
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </DisclosurePanel>
                      </Disclosure>
                    </li>
                  ))}
                </ul>
              </li>
              {/* <li className="mt-auto">
                <Link
                  href={AppRoute.Settings}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer"
                >
                  <Cog6ToothIcon
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0"
                  />
                  Settings
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
