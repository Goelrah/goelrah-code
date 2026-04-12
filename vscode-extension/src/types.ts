export interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream: boolean;
  options?: { temperature?: number; num_predict?: number };
}

export interface StreamChunk {
  model: string;
  message: { role: string; content: string };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export interface ModelInfo {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface EditorContext {
  fileName: string;
  filePath: string;
  language: string;
  content: string;
  selection?: { text: string; startLine: number; endLine: number };
}

export interface DiagnosticsContext {
  filePath: string;
  diagnostics: Array<{
    message: string;
    severity: string;
    range: { startLine: number; endLine: number };
    source?: string;
  }>;
}

export interface WorkspaceContext {
  name: string;
  rootPath: string;
  fileCount: number;
  gitBranch?: string;
}
