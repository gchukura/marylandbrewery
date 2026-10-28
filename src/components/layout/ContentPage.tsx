import type { ReactNode } from 'react';
import type { Crumb } from '@/lib/seo/jsonld';
import PageHeader from '@/components/ui/PageHeader';

interface ContentPageProps {
  breadcrumbs: Crumb[];
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}

/**
 * Text pages (FAQ, terms, our story...): the page header, then one readable column. Headings,
 * paragraphs, lists and links inside take their styles from .prose-page in globals.css.
 */
export default function ContentPage({
  breadcrumbs,
  title,
  intro,
  children,
}: ContentPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader breadcrumbs={breadcrumbs} title={title} intro={intro} />
      <div className="prose-page max-w-3xl">{children}</div>
    </div>
  );
}
