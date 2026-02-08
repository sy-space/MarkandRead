import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { Extension } from '@codemirror/state';

import { CanvasStore } from './src/core/canvas-store';
import { EntryCache } from './src/core/cache';
import { createHighlighter } from './src/core/highlighter';
import { addWordCommand } from './src/commands/add-word';
import {
  MarkAndReadSidebar,
  SIDEBAR_VIEW_TYPE
} from './src/ui/sidebar';

import {
  MarkAndReadSettings,
  DEFAULT_SETTINGS
} from './src/settings';
import { MarkAndReadSettingTab } from './src/ui/settings-tab';
import { AIService } from './src/ai/ai-service';

export default class MarkAndReadPlugin extends Plugin {
  settings!: MarkAndReadSettings;

  private canvasStore!: CanvasStore;
  private cache!: EntryCache;
  private aiService!: AIService;

  async onload() {
    await this.loadSettings();

    const canvasPath = this.settings.canvasPath;

    this.canvasStore = new CanvasStore(this.app, canvasPath);
    this.cache = new EntryCache(this.app, canvasPath);
    this.aiService = new AIService(this.settings.ai);

    await this.cache.load();

    // ✅ 保存 command 对象
    const addCmd = addWordCommand(
      this.app,
      this.canvasStore,
      this.cache,
      this.aiService
    );
    this.addCommand(addCmd);

    // ✅ 重排 Canvas 命令
    this.addCommand({
      id: 'reflow-reading-canvas',
      name: 'Reflow Reading Canvas Layout',
      callback: async () => {
        await this.canvasStore.reflowLayout();
        await this.cache.reload();
        this.refreshSidebar();
      }
    });

    // ✅ 右键菜单添加（关键：强制把 on(...) 的返回值当 EventRef）
    this.registerEvent(
      (this.app.workspace as any).on(
        'editor-menu',
        (menu: any, editor: any) => {
          const selection = editor?.getSelection?.()?.trim?.();
          if (!selection) return;
    
          menu.addItem((item: any) => {
            item
              .setTitle('Add to Reading Canvas')
              .setIcon('plus')
              .onClick(async () => {
                if (addCmd.callback) {
                  await addCmd.callback();
                }
              });
          });
        }
      ) as any
    );
    
   // Sidebar
    this.registerView(
      SIDEBAR_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new MarkAndReadSidebar(leaf, this.cache)
    );

    this.addSettingTab(new MarkAndReadSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      const highlighter: Extension = createHighlighter(this.cache);
      this.registerEditorExtension(highlighter);
      this.activateSidebar();
    });

    // ✅ 监听 Canvas 文件变化
    this.registerEvent(
      this.app.vault.on('modify', async (file) => {
        if (!(file instanceof TFile)) return;
        if (file.path !== canvasPath) return;

        await this.cache.reload();
        this.refreshSidebar();
      })
    );

    console.log('[MarkAndRead] loaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.aiService.updateSettings(this.settings.ai);
  }

  private async activateSidebar() {
    const leaves = this.app.workspace.getLeavesOfType(SIDEBAR_VIEW_TYPE);
    if (leaves.length > 0) return;

    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;

    await leaf.setViewState({
      type: SIDEBAR_VIEW_TYPE,
      active: true
    });
  }

  private refreshSidebar() {
    const leaves = this.app.workspace.getLeavesOfType(SIDEBAR_VIEW_TYPE);

    for (const leaf of leaves) {
      const view = leaf.view as MarkAndReadSidebar;
      view.refresh();
    }
  }
}
