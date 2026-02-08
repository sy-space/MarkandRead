export interface AISettings {
  enabled: boolean;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface MarkAndReadSettings {
  canvasPath: string;
  ai: AISettings;
}

export const DEFAULT_SETTINGS: MarkAndReadSettings = {
  canvasPath: 'Reading.canvas',
  ai: {
    enabled: true,
    apiKey: '',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4.7-flash'
  }
};
