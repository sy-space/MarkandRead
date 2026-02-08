import { App, MarkdownView, Notice, Command } from 'obsidian';
import { CanvasStore } from '../core/canvas-store';
import { EntryCache } from '../core/cache';
import { normalizeText } from '../utils/normalize';
import { VocabEntry } from '../core/entry';
import { AIService } from '../ai/ai-service';

export function addWordCommand(
  app: App,
  store: CanvasStore,
  cache: EntryCache,
  ai: AIService
): Command {
  return {
    id: 'add-to-reading-canvas',
    name: 'Add to Reading Canvas',
    callback: async () => {
      const view = app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) {
        new Notice('No active Markdown view');
        return;
      }

      const text = view.editor.getSelection().trim();
      if (!text) {
        new Notice('No text selected');
        return;
      }

      const normalized = normalizeText(text);

      // ⭐ 去重检查（在 AI 调用前）
      if (cache.exists(normalized)) {
        new Notice(`Already in Reading Canvas: ${text}`);
        return;
      }

      const type = text.includes(' ') ? 'phrase' : 'word';

      let definition: string | undefined = undefined;

      // ---------- AI definition ----------
      const aiResult = await ai.generateDefinition(text);
      if (aiResult && aiResult.length > 0) {
        definition = aiResult;
      }
      // -----------------------------------

      const entry: VocabEntry = {
        id: crypto.randomUUID(),
        type,
        text,
        normalized,
        definition,
        mastered: false
      };

      await store.addEntry(entry);
      await cache.reload();

      new Notice(
        definition
          ? `Added ${type}: ${text}`
          : `Added ${type}: ${text} (no definition)`
      );
    }
  };
}
