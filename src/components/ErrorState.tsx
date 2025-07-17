import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Archive Not Found",
  message = "The archive you're looking for doesn't exist or has been removed.",
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
    </div>
  );
};
