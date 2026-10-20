/**
 * Plain-text matching for the quick search (Ctrl+K). Accents and case are
 * ignored, so "pena" finds "Peñalolén" and "tactico" finds "Tablero Táctico".
 */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
}

/**
 * Score how well `query` matches `text`: 3 whole text starts with it, 2 a word
 * starts with it, 1 it appears anywhere, 0 no match. Every word of the query
 * must appear, so "juan car" finds "Juan Carlos".
 */
export function matchScore(text: string, query: string): number {
  const q = normalize(query)
  if (!q) return 1
  const t = normalize(text)
  const words = q.split(/\s+/)
  if (!words.every(w => t.includes(w))) return 0
  if (t.startsWith(q)) return 3
  if (t.split(/[\s\-·/]+/).some(w => w.startsWith(words[0]))) return 2
  return 1
}

/** Keep the matching items, best first; ties keep their original order. */
export function rankItems<T>(items: T[], query: string, textOf: (item: T) => string, limit = 8): T[] {
  return items
    .map((item, i) => ({ item, i, s: matchScore(textOf(item), query) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map(x => x.item)
}
