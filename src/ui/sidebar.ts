import { ItemView, WorkspaceLeaf } from 'obsidian';
import { EntryCache } from '../core/cache';
import { VocabEntry } from '../core/entry';

export const SIDEBAR_VIEW_TYPE = 'mark-and-read-sidebar';

export class MarkAndReadSidebar extends ItemView {
  private cache: EntryCache;

  constructor(leaf: WorkspaceLeaf, cache: EntryCache) {
    super(leaf);
    this.cache = cache;
  }

  getViewType(): string {
    return SIDEBAR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Reading Cards';
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  async onClose(): Promise<void> {}

  refresh() {
    this.render();
  }

  private render() {
    const container = this.containerEl;
    container.empty();

    // ⭐ 只显示 unfamiliar
    const entries: VocabEntry[] = this.cache.getUnfamiliar();

    if (entries.length === 0) {
      container.createEl('div', { text: 'No unfamiliar cards.' });
      return;
    }

    for (const entry of entries) {
      const card = container.createDiv({ cls: 'mr-card' });

      card.createEl('div', {
        text: entry.text,
        cls: 'mr-card-title'
      });

      if (entry.definition) {
        card.createEl('div', {
          text: entry.definition,
          cls: 'mr-card-definition'
        });
      }
    }
  }
}
