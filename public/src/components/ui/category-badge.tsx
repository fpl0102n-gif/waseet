import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  label: string;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CategoryBadge = ({ 
  label, 
  color = "#3b82f6", 
  className,
  size = "sm"
}: CategoryBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  return (
    <Badge
      className={cn(
        "font-medium border",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color
      }}
    >
      {label}
    </Badge>
  );
};

