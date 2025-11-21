import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  gradient?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  gradient = "from-blue-500 to-blue-600",
  className = "",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br",
        gradient,
        "rounded-lg p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border border-white/10",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/90 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {unit && <p className="text-lg text-white/80">{unit}</p>}
          </div>
        </div>
        {icon && <div className="text-4xl opacity-90">{icon}</div>}
      </div>
    </div>
  );
}
