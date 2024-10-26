import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col lg:flex-row w-full h-full">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">{children}</div>
        </div>
        <div className="relative hidden lg:flex lg:flex-1">
          <Image
            alt=""
            src="/img/desk.avif"
            fill
            className="object-cover rounded-l-md"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
