/**
 * Çift dilli kayıtlardan aktif dile uygun alanı seçer.
 * Örn. pickField({ titleTr, titleEn }, locale, "title")
 */
export function pickField<T extends Record<string, unknown>>(
  record: T,
  locale: string,
  base: string,
): string {
  const suffix = locale === "en" ? "En" : "Tr";
  const value = record[`${base}${suffix}`];
  if (typeof value === "string" && value.length > 0) return value;
  // yedek: diğer dil
  const fallback = record[`${base}${suffix === "En" ? "Tr" : "En"}`];
  return typeof fallback === "string" ? fallback : "";
}

export function pickArray<T extends Record<string, unknown>>(
  record: T,
  locale: string,
  base: string,
): string[] {
  const suffix = locale === "en" ? "En" : "Tr";
  const value = record[`${base}${suffix}`];
  if (Array.isArray(value)) return value as string[];
  const fallback = record[`${base}${suffix === "En" ? "Tr" : "En"}`];
  return Array.isArray(fallback) ? (fallback as string[]) : [];
}
