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

// Prefetch a list of routes (client-side). Use sparingly for common nav.
export async function prefetchRoutes(paths: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const { prefetch } = await import('next/navigation');
    paths.forEach((p) => {
      try { prefetch(p); } catch {}
    });
  } catch {}
}
