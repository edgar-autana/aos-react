import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "skeleton";
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

export function Loading({ 
  variant = "spinner", 
  size = "md", 
  text,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  const renderSpinner = () => (
    <Loader2 className={cn(
      "animate-spin text-primary",
      sizeClasses[size]
    )} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className={cn(
        "animate-bounce rounded-full bg-primary",
        size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-4 w-4"
      )} style={{ animationDelay: "0ms" }} />
      <div className={cn(
        "animate-bounce rounded-full bg-primary",
        size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-4 w-4"
      )} style={{ animationDelay: "150ms" }} />
      <div className={cn(
        "animate-bounce rounded-full bg-primary",
        size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-4 w-4"
      )} style={{ animationDelay: "300ms" }} />
    </div>
  );

  const renderPulse = () => (
    <Loader2 className={cn(
      "animate-pulse text-primary",
      sizeClasses[size]
    )} />
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      <div className="animate-pulse bg-muted rounded h-4 w-3/4" />
      <div className="animate-pulse bg-muted rounded h-4 w-1/2" />
      <div className="animate-pulse bg-muted rounded h-4 w-5/6" />
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "skeleton":
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4",
      className
    )}>
      {renderContent()}
      {text && (
        <p className={cn(
          "text-muted-foreground animate-pulse",
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

// Specialized loading components for common use cases
export function LoadingSpinner({ size = "md", text, className }: Omit<LoadingProps, "variant">) {
  return <Loading variant="spinner" size={size} text={text} className={className} />;
}

export function LoadingDots({ size = "md", text, className }: Omit<LoadingProps, "variant">) {
  return <Loading variant="dots" size={size} text={text} className={className} />;
}

export function LoadingPulse({ size = "md", text, className }: Omit<LoadingProps, "variant">) {
  return <Loading variant="pulse" size={size} text={text} className={className} />;
}

export function LoadingSkeleton({ size = "md", text, className }: Omit<LoadingProps, "variant">) {
  return <Loading variant="skeleton" size={size} text={text} className={className} />;
}

// Page loading component
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Table loading component
export function TableLoading({ text = "Loading data..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Card loading component
export function CardLoading() {
  return (
    <div className="p-6">
      <LoadingSkeleton size="md" />
    </div>
  );
} 