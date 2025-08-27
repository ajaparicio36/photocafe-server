import React from "react";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

interface ErrorStateProps {
  message?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong. Please try again.",
}) => {
  return (
    <div className="min-h-screen brand-bg-primary flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <Image
            src="/clickclick_logo.png"
            alt="Click Click Photobooth Cafe"
            width={160}
            height={64}
            className="brand-logo mx-auto mb-4"
          />
        </div>
        <AlertCircle className="h-12 w-12 brand-text-light mx-auto mb-4" />
        <h2 className="text-xl font-semibold brand-text-light mb-2">Oops!</h2>
        <p className="brand-text-light opacity-80">{message}</p>
      </div>
    </div>
  );
};
