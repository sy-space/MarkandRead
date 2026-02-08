import { AISettings } from '../settings';

export class AIService {
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
  }

  updateSettings(settings: AISettings) {
    this.settings = settings;
  }

  async generateDefinition(word: string): Promise<string | null> {
    if (!this.settings.enabled) return null;
    if (!this.settings.apiKey) return null;

    try {
      const res = await fetch(this.settings.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'user',
              content: `Give a concise English definition of the word or phrase "${word}". One sentence only.`
            }
          ]
        })
      });

      if (!res.ok) return null;

      const json = await res.json();
      return json?.choices?.[0]?.message?.content?.trim() ?? null;
    } catch {
      return null;
    }
  }
}
