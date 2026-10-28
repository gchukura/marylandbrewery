import { type ClassValue, clsx } from 'clsx';

/**
 * Joins class names. No tailwind-merge (it was 8.6 KB gzipped in every page's JS): components must
 * not pass classes that conflict with a base class; give the base a variant instead.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
