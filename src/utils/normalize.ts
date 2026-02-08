/**
 * Normalize text for matching and indexing
 *
 * Rules (v0.1, locked):
 * - trim
 * - lowercase
 * - collapse multiple spaces
 * - DO NOT stem
 * - DO NOT lemmatize
 * - DO NOT remove punctuation inside phrase
 */

export function normalizeText(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
  
  /**
   * Helper: detect entry type explicitly
   * (used when user adds a card)
   */
  export function detectEntryType(text: string): 'word' | 'phrase' {
    return text.includes(' ') ? 'phrase' : 'word';
  }
  