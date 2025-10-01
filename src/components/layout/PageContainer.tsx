import React from 'react';

interface PageContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
