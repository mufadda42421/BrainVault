import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        hoverEffect
          ? 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5'
          : ''
      } bg-slate-900/60 dark:bg-slate-900/60 border-slate-800/80 backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
