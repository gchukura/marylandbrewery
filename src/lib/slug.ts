/** URL-friendly slug: "Queen Anne's County" -> "queen-annes-county". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // drop punctuation except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // spaces and underscores become hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/** Readable text from a slug: "ellicott-city" -> "Ellicott City". Lossy (no apostrophes). */
export function deslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
