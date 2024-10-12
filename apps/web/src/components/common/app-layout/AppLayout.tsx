import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 bg-gray-800">
          <div className="my-8 mx-4 sm:mx-6 lg:mx-8 py-8 px-4 sm:px-6 lg:px-8 border-1 rounded-lg bg-gray-900">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
