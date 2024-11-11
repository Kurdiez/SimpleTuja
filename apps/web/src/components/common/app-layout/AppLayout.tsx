import React, { useState } from "react";
import { Typography } from "../Typography";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children?: React.ReactNode;
  pageTitle: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "Crypto Lending",
  ]);

  return (
    <div className="flex h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        openSections={openSections}
        setOpenSections={setOpenSections}
      />

      <div className="flex flex-col flex-1 lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 bg-gray-800 relative z-0">
          <div className="my-8 mx-4 sm:mx-6 lg:mx-8 py-8 px-4 sm:px-6 lg:px-8 border-1 rounded-lg bg-gray-900">
            <Typography.DisplayXL className="mb-12 text-white">
              {pageTitle}
            </Typography.DisplayXL>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
