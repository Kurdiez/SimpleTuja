import React from "react";
import classNames from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) => {
  return (
    <button
      className={classNames(
        "rounded-md px-3.5 py-2.5 text-sm font-semibold text-white",
        "shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        "flex items-center justify-center relative",
        {
          "bg-primary hover:bg-primary-light": !disabled,
          "bg-gray-400 cursor-default": disabled,
          "opacity-75 cursor-not-allowed": loading,
        },
        className
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      <span className={loading ? "invisible" : "visible"}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
};

export default Button;
