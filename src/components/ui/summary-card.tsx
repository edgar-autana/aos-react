import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  isActive?: boolean;
}

export function SummaryCard({ 
  title, 
  value, 
  icon, 
  className,
  valueClassName,
  isActive = false
}: SummaryCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      isActive 
        ? "bg-gradient-to-br from-slate-700 to-slate-600 border-blue-400/50 shadow-lg" 
        : "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-tr to-transparent",
        isActive 
          ? "from-blue-500/20 via-cyan-500/10" 
          : "from-blue-500/10 via-cyan-500/5"
      )} />
      <div className={cn(
        "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl",
        isActive 
          ? "bg-blue-500/20" 
          : "bg-blue-500/10"
      )} />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-slate-400">
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative">
        <div className={cn(
          "text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",
          valueClassName
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}