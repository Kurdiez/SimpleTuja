import React from "react";
import classNames from "classnames";

interface LoadSpinnerProps {
  className?: string;
}

const LoadSpinner: React.FC<LoadSpinnerProps> = ({ className }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={classNames(
          "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary",
          className
        )}
      ></div>
    </div>
  );
};

export default LoadSpinner;
