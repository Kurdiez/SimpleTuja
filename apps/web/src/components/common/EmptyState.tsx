import React from "react";

interface EmptyStateProps {
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, label }) => {
  return (
    <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-700 p-12 text-center">
      <Icon className="mx-auto size-12 text-gray-400" aria-hidden="true" />
      <span className="mt-2 block text-sm font-semibold text-gray-300">
        {label}
      </span>
    </div>
  );
};

export default EmptyState;
