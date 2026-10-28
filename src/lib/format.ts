/** US phone numbers as "(410) 555-0123"; anything else is returned unchanged. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return phone;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}

/**
 * A stored website or social link as an absolute URL. Values saved without a scheme
 * ("www.libcobeer.com") would otherwise become relative links that 404.
 */
export function externalUrl(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return `https://${v}`;
  return undefined;
}
