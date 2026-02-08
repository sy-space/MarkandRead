import { App, TFile } from 'obsidian';
import { VocabEntry } from './entry';

export class CanvasStore {
  private app: App;
  private canvasPath: string;

  private readonly LEFT_X = 0;
  private readonly RIGHT_X = 420;
  private readonly SPACING = 180;

  constructor(app: App, canvasPath: string) {
    this.app = app;
    this.canvasPath = canvasPath;
  }

  async ensureCanvas(): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(this.canvasPath);
    if (existing instanceof TFile) return existing;

    return await this.app.vault.create(
      this.canvasPath,
      JSON.stringify({ nodes: [], edges: [] }, null, 2)
    );
  }

  // =========================
  // 新卡写入（自动分栏）
  // =========================
  async addEntry(entry: VocabEntry): Promise<void> {
    const file = await this.ensureCanvas();

    await this.app.vault.process(file, (content) => {
      let data: any;
      try {
        data = JSON.parse(content);
      } catch {
        data = { nodes: [], edges: [] };
      }

      if (!Array.isArray(data.nodes)) data.nodes = [];

      let leftMaxY = 0;
      let rightMaxY = 0;

      for (const node of data.nodes) {
        if (node.type !== 'text') continue;

        const text: string = node.text || '';
        const isFamiliar = text.includes('#familiar');

        if (isFamiliar) {
          rightMaxY = Math.max(rightMaxY, node.y || 0);
        } else {
          leftMaxY = Math.max(leftMaxY, node.y || 0);
        }
      }

      const isFamiliar = entry.mastered;

      const x = isFamiliar ? this.RIGHT_X : this.LEFT_X;
      const y = isFamiliar
        ? rightMaxY + this.SPACING
        : leftMaxY + this.SPACING;

      const lines: string[] = [];

      lines.push(entry.normalized);

      if (entry.definition) {
        lines.push('');
        lines.push(entry.definition);
      }

      lines.push('');
      lines.push(`#${entry.type}`);
      lines.push(entry.mastered ? '#familiar' : '#unfamiliar');

      data.nodes.push({
        id: entry.id,
        type: 'text',
        x,
        y,
        width: 320,
        height: 160,
        text: lines.join('\n')
      });

      return JSON.stringify(data, null, 2);
    });
  }

  // =========================
  // 自动重排 Canvas
  // =========================
  async reflowLayout(): Promise<void> {
    const file = await this.ensureCanvas();

    await this.app.vault.process(file, (content) => {
      let data: any;
      try {
        data = JSON.parse(content);
      } catch {
        return content;
      }

      if (!Array.isArray(data.nodes)) return content;

      let leftY = 0;
      let rightY = 0;

      for (const node of data.nodes) {
        if (node.type !== 'text') continue;

        const text: string = node.text || '';
        const isFamiliar = text.includes('#familiar');

        if (isFamiliar) {
          node.x = this.RIGHT_X;
          node.y = rightY;
          rightY += this.SPACING;
        } else {
          node.x = this.LEFT_X;
          node.y = leftY;
          leftY += this.SPACING;
        }
      }

      return JSON.stringify(data, null, 2);
    });
  }
}
