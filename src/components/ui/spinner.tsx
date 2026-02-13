import React from "react";

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
    </div>
  );
};
