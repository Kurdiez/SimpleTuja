import React, { useState, forwardRef, useEffect } from "react";
import { Switch } from "@headlessui/react";

interface ToggleProps {
  className?: string;
  onChange?: (checked: boolean) => void;
  initialChecked?: boolean;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className = "", onChange, initialChecked = false }, ref) => {
    const [enabled, setEnabled] = useState(initialChecked);

    useEffect(() => {
      setEnabled(initialChecked);
    }, [initialChecked]);

    const handleChange = (checked: boolean) => {
      setEnabled(checked);
      if (onChange) {
        onChange(checked);
      }
    };

    return (
      <Switch
        ref={ref}
        checked={enabled}
        onChange={handleChange}
        className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[checked]:bg-primary ${className}`}
      >
        <span className="sr-only">Use setting</span>
        <span className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5">
          <span
            aria-hidden="true"
            className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in group-data-[checked]:opacity-0 group-data-[checked]:duration-100 group-data-[checked]:ease-out"
          >
            <svg
              fill="none"
              viewBox="0 0 12 12"
              className="h-3 w-3 text-gray-400"
            >
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-[checked]:opacity-100 group-data-[checked]:duration-200 group-data-[checked]:ease-in"
          >
            <svg
              fill="currentColor"
              viewBox="0 0 12 12"
              className="h-3 w-3 text-primary"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
