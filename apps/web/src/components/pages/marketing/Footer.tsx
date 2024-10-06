import InstagramIcon from "../../icons/InstagramIcon";
import XIcon from "../../icons/XIcon";
import DiscordIcon from "../../icons/DiscordIcon";

const navigation = {
  main: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ],
  social: [
    {
      name: "Instagram",
      href: "#",
      icon: InstagramIcon,
    },
    {
      name: "X",
      href: "#",
      icon: XIcon,
    },
    {
      name: "Discord",
      href: "https://discord.gg/your-server-link",
      icon: DiscordIcon,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-900 border-t border-gray-700">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          aria-label="Footer"
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <a
                href={item.href}
                className="text-sm leading-6 text-gray-300 hover:text-gray-100"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        <div className="mt-10 flex justify-center space-x-10">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon aria-hidden="true" className="h-6 w-6" />
            </a>
          ))}
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; 2024 SimpleTuja. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
