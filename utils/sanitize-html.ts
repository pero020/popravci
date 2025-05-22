/**
 * Simple HTML sanitizer for server-side rendering
 * This is a lightweight approach focused on SEO rather than security
 * Security is handled by client-side DOMPurify
 */
export function simpleSanitizeHtml(html: string | null): string {
  if (!html) return '';
  
  // This is a simplified approach that keeps basic HTML structure for SEO
  // but removes potentially harmful script tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '')
    .trim();
}