/** Detect HTML vs plain text article body */
export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content.trim())
}

/** Plain-text excerpt from HTML or markdown-like content */
export function plainTextFromContent(content: string, maxLen = 200): string {
  const text = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
}
