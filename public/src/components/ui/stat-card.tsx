import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  value: string | number;
  label: string;
  description?: string;
  icon?: ReactNode;
  accent?: 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({ value, label, description, icon, accent = 'primary', className = '' }: StatCardProps) {
  return (
    <div className={clsx('rounded-xl border border-border/60 bg-card p-6 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-center gap-3">
        {icon && <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shadow-sm',
          accent === 'primary' && 'bg-primary/10 text-primary',
          accent === 'accent' && 'bg-accent/10 text-accent',
          accent === 'secondary' && 'bg-secondary/10 text-secondary',
          accent === 'success' && 'bg-success/10 text-success',
          accent === 'warning' && 'bg-warning/10 text-warning',
          accent === 'destructive' && 'bg-red-100/50 text-red-600'
        )}>{icon}</div>}
        <div className="text-2xl font-semibold text-brand-gradient">{value}</div>
      </div>
      <div className="text-sm font-medium text-foreground/85">{label}</div>
      {description && <p className="text-xs text-foreground/60 leading-relaxed">{description}</p>}
    </div>
  );
}

export default StatCard;
