export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n')
}

export function splitLinesNoTrailingEmpty(text: string): string[] {
  const normalized = normalizeNewlines(text)
  const segments = normalized.split('\n')
  const lastIndex = segments.length - 1
  if (lastIndex >= 0 && segments[lastIndex] === '') segments.pop()
  return segments
}
