import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "pulse";
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "default",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    default: "border-indigo-600",
    gradient: "border-gradient-to-r from-indigo-600 to-purple-600",
    pulse: "border-indigo-600 animate-pulse",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-4
          border-t-transparent
          rounded-full
          animate-spin
          ${variantClasses[variant]}
        `}
      />
    </div>
  );
};

export const LoadingText: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <Loading size="md" variant="gradient" />
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export const LoadingPage: React.FC<{
  text?: string;
}> = ({ text }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <LoadingText text={text} />
    </div>
  );
};

export default Loading;
