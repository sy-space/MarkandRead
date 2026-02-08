import { Extension, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { EntryCache } from './cache';

export function createHighlighter(cache: EntryCache): Extension {
  const field = StateField.define<DecorationSet>({
    create(state) {
      return buildDecorations(state, cache);
    },

    update(decorations, tr) {
      const v = cache.getVersion();

      if (tr.docChanged || v !== (decorations as any)._v) {
        const next = buildDecorations(tr.state, cache);
        (next as any)._v = v;
        return next;
      }

      return decorations;
    },

    provide: f => EditorView.decorations.from(f)
  });

  return [field];
}

function buildDecorations(
  state: EditorView['state'],
  cache: EntryCache
): DecorationSet {
  const doc = state.doc;
  const lowerText = doc.toString().toLowerCase();

  const entries = cache.getUnfamiliar();

  const ranges: any[] = [];

  for (const entry of entries) {
    const key = entry.normalized;
    if (!key) continue;

    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex =
      entry.type === 'word'
        ? new RegExp(`\\b${escaped}\\b`, 'g')
        : new RegExp(escaped, 'g');

    const cls =
      entry.type === 'phrase'
        ? 'mark-and-read-phrase'
        : 'mark-and-read-word';

    let m: RegExpExecArray | null;
    while ((m = regex.exec(lowerText))) {
      const from = m.index;
      const to = from + m[0].length;

      const line = doc.lineAt(from);
      const lineText = line.text;
      if (lineText.includes('```') || lineText.includes('`')) continue;

      ranges.push(
        Decoration.mark({ class: cls }).range(from, to)
      );
    }
  }

  const result = Decoration.set(ranges, true);
  (result as any)._v = cache.getVersion();

  return result;
}
