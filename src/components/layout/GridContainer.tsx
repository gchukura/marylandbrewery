import React from 'react';

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function GridContainer({ children, className = '' }: GridContainerProps) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
    </div>
  );
}
