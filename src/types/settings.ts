export interface AppSettings {
  endpointUrl: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  theme: 'dark' | 'light';
  agentName: string;
}

export interface ModelInfo {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface EndpointHealth {
  reachable: boolean;
  latencyMs: number;
  models: ModelInfo[];
  error?: string;
}
