import React from 'react';

interface ContentWithSidebarProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  stickySidebar?: boolean;
  className?: string;
}

export default function ContentWithSidebar({ sidebar, children, stickySidebar = false, className = '' }: ContentWithSidebarProps) {
  return (
    <div className={`grid gap-6 lg:grid-cols-3 ${className}`}>
      <aside className={stickySidebar ? 'lg:col-span-1 lg:sticky lg:top-20 self-start' : 'lg:col-span-1'}>
        {sidebar}
      </aside>
      <section className="lg:col-span-2">
        {children}
      </section>
    </div>
  );
}
