export type Noop = () => void;

// Lazy import helper for client-only heavy components
export function lazyClient<T extends object>(factory: () => Promise<{ default: React.ComponentType<T> }>, Loading?: React.ReactNode) {
  // Consumers should wrap with next/dynamic in their component files.
  return { factory, Loading };
}

// Simple intersection observer utility
export function createIntersectionObserver(
  targets: Element[] | NodeListOf<Element>,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { rootMargin: '200px 0px', threshold: 0 }
): () => void {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) callback(e);
    }
  }, options);

  targets.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

// Prefetch a list of routes by injecting <link rel="prefetch"> tags (App Router safe)
export function prefetchRoutes(paths: string[]) {
  if (typeof document === 'undefined') return;
  for (const p of paths) {
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = p;
      // Best-effort hint; some browsers support as=document for navigations
      link.as = 'document' as any;
      document.head.appendChild(link);
    } catch {}
  }
}
