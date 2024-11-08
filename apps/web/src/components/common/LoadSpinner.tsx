import classNames from "classnames";
import React from "react";

interface LoadSpinnerProps {
  className?: string;
}

const LoadSpinner: React.FC<LoadSpinnerProps> = ({ className }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={classNames(
          "animate-spin rounded-full border-t-2 border-b-2 border-primary",
          className || "h-12 w-12"
        )}
      ></div>
    </div>
  );
};

export default LoadSpinner;
