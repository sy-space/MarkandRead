export type EntryType = 'word' | 'phrase';

export interface VocabEntry {
  id: string;           // Canvas node id
  type: EntryType;      // 'word' | 'phrase'
  text: string;         // Original text
  normalized: string;   // lowercase, trimmed
  definition?: string;  // optional, v0.1 can be empty
  mastered: boolean;    // simple boolean
  sourceFile?: string;  // optional: where it was added
}
