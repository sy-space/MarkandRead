import { App, TFile } from 'obsidian';
import { VocabEntry } from './entry';

export class EntryCache {
  private app: App;
  private canvasPath: string;

  private entries: VocabEntry[] = [];
  private index: Map<string, VocabEntry> = new Map(); // normalized → entry
  private version = 0; // ⭐ cache 版本号

  constructor(app: App, canvasPath: string) {
    this.app = app;
    this.canvasPath = canvasPath;
  }

  async load(): Promise<void> {
    this.entries = [];
    this.index.clear();

    const file = this.app.vault.getAbstractFileByPath(this.canvasPath);
    if (!(file instanceof TFile)) return;

    let data: any;
    try {
      data = JSON.parse(await this.app.vault.read(file));
    } catch {
      return;
    }

    if (!Array.isArray(data.nodes)) return;

    for (const node of data.nodes) {
      if (node.type !== 'text' || typeof node.text !== 'string') continue;

      const entry = this.parseNode(node.id, node.text);
      if (!entry) continue;
      if (!entry.text.trim()) continue;

      // ⭐ 去重：normalized 冲突时忽略后者
      if (this.index.has(entry.normalized)) continue;

      this.entries.push(entry);
      this.index.set(entry.normalized, entry);
    }

    // ⭐ 通知 highlighter cache 已更新
    this.version++;
  }

  async reload(): Promise<void> {
    await this.load();
  }

  getAllEntries(): VocabEntry[] {
    return [...this.entries];
  }

  // ⭐ 只返回 unfamiliar
  getUnfamiliar(): VocabEntry[] {
    return this.entries.filter(e => !e.mastered);
  }

  exists(normalized: string): boolean {
    return this.index.has(normalized.toLowerCase());
  }

  // ⭐ 给 highlighter 用
  getVersion(): number {
    return this.version;
  }

  // =========================
  // Parser (末尾标签区语法)
  // =========================
  private parseNode(id: string, text: string): VocabEntry | null {
    const rawLines = text.split('\n');

    const lines = rawLines.map(l => l.trim());

    // 去掉头尾空行
    while (lines.length && !lines[0]) lines.shift();
    while (lines.length && !lines[lines.length - 1]) lines.pop();

    if (lines.length === 0) return null;

    const title = lines[0];
    if (!title) return null;

    // 从底部扫描标签区
    const tagLines: string[] = [];
    let i = lines.length - 1;

    while (i > 0 && lines[i].startsWith('#')) {
      tagLines.unshift(lines[i]);
      i--;
    }

    const contentLines = lines.slice(1, i + 1);

    const type =
      tagLines.includes('#phrase')
        ? 'phrase'
        : tagLines.includes('#word')
        ? 'word'
        : 'word';

    const mastered = tagLines.includes('#familiar');

    const definition =
      contentLines.length > 0
        ? contentLines.join('\n').trim()
        : undefined;

    return {
      id,
      text: title,
      normalized: title.toLowerCase(),
      type,
      mastered,
      definition
    };
  }
}
