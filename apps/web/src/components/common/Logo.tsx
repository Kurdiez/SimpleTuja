import React from "react";
import classNames from "classnames";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div
      className={classNames(
        "rounded-md font-semibold text-primary text-2xl py-1",
        "shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        "flex items-center justify-center border border-primary",
        "select-none w-24 tracking-wider",
        className
      )}
    >
      STJ
    </div>
  );
};

export default Logo;
