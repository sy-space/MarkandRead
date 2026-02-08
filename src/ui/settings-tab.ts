import { App, PluginSettingTab, Setting } from 'obsidian';
import MarkAndReadPlugin from '../../main';

export class MarkAndReadSettingTab extends PluginSettingTab {
  plugin: MarkAndReadPlugin;

  constructor(app: App, plugin: MarkAndReadPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Mark & Read — Settings' });

    // Canvas Path
    new Setting(containerEl)
      .setName('Canvas file path')
      .setDesc('Where vocab cards are stored (e.g. Reading.canvas)')
      .addText(text =>
        text
          .setValue(this.plugin.settings.canvasPath)
          .onChange(async value => {
            this.plugin.settings.canvasPath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h2', { text: 'AI Settings' });

    // Enable AI
    new Setting(containerEl)
      .setName('Enable AI definition')
      .setDesc('Automatically generate English definitions when adding entries')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.ai.enabled)
          .onChange(async value => {
            this.plugin.settings.ai.enabled = value;
            await this.plugin.saveSettings();
          })
      );

    // API Key
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Your AI service API key')
      .addText(text =>
        text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.ai.apiKey)
          .onChange(async value => {
            this.plugin.settings.ai.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    // Endpoint
    new Setting(containerEl)
      .setName('API Endpoint')
      .setDesc('OpenAI-compatible chat/completions endpoint')
      .addText(text =>
        text
          .setValue(this.plugin.settings.ai.endpoint)
          .onChange(async value => {
            this.plugin.settings.ai.endpoint = value;
            await this.plugin.saveSettings();
          })
      );

    // Model
    new Setting(containerEl)
      .setName('Model')
      .setDesc('Model name (e.g. glm-4.7-flash)')
      .addText(text =>
        text
          .setValue(this.plugin.settings.ai.model)
          .onChange(async value => {
            this.plugin.settings.ai.model = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
