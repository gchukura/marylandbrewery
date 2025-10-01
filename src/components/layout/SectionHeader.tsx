import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ title, subtitle, actions, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-h2 font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-1 text-small text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="mt-2 h-1 w-16 bg-md-red rounded" />
    </div>
  );
}
