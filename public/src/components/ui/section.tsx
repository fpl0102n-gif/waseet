import { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  center?: boolean;
  id?: string;
  variant?: 'default' | 'hero' | 'charity' | 'alkhayr';
}

export function Section({ title, subtitle, children, padding = 'md', className = '', center = false, id, variant = 'default' }: SectionProps) {
  const padMap = {
    sm: 'py-10',
    md: 'py-16',
    lg: 'py-24'
  }[padding];
  const variantClass = {
    default: '',
    hero: 'bg-gradient-hero',
    charity: 'charity-gradient-bg relative',
    alkhayr: 'theme-alkhayr bg-background text-foreground',
  }[variant];

  const titleClass = (variant === 'charity' || variant === 'alkhayr')
    ? 'text-2xl md:text-3xl font-bold tracking-tight mb-4 text-primary'
    : 'text-xl md:text-2xl font-semibold tracking-tight mb-3 text-brand-gradient';

  const subtitleClass = (variant === 'charity' || variant === 'alkhayr')
    ? 'text-base md:text-lg text-muted-foreground max-w-3xl font-medium'
    : 'text-sm md:text-base text-foreground/65 max-w-2xl';

  return (
    <section id={id} className={clsx(padMap, variantClass, className, 'relative overflow-hidden')}>
      {variant === 'charity' && (
        <>
          {/* Effet de lueur animée */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-accent/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        </>
      )}
      <div className="app-shell relative z-10">
        {(title || subtitle) && (
          <div className={clsx('mb-12', center && 'text-center')}>
            {title && (
              <h2 className={titleClass}>{title}</h2>
            )}
            {subtitle && (
              <p className={clsx(subtitleClass, center ? 'mx-auto' : '')}>{subtitle}</p>
            )}
            {variant === 'charity' && (
              <div className="charity-section-divider"></div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;
