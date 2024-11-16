import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React from "react";

type CalloutType = "info" | "critical" | "warning";

interface CalloutProps {
  type: CalloutType;
  children: React.ReactNode;
}

const typeStyles: Record<
  CalloutType,
  {
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-200",
    icon: InformationCircleIcon,
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-900",
    text: "text-red-800 dark:text-red-200",
    icon: XCircleIcon,
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: ExclamationTriangleIcon,
  },
};

export const Callout: React.FC<CalloutProps> = ({ type, children }) => {
  const styles = typeStyles[type];
  const Icon = styles.icon;

  return (
    <div className={`p-4 ${styles.bg} rounded-md`}>
      <div className={`text-sm ${styles.text} flex items-center`}>
        <Icon className="h-6 w-6 flex-shrink-0" />
        <div className="ml-3 sm:ml-2">{children}</div>
      </div>
    </div>
  );
};
