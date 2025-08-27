import React from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
}) => {
  return (
    <div className="min-h-screen brand-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/clickclick_logo.png"
            alt="Click Click Photobooth Cafe"
            width={200}
            height={80}
            className="brand-logo mx-auto"
            priority
          />
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 brand-text-light" />
        <p className="brand-text-light text-lg">{message}</p>
      </div>
    </div>
  );
};
