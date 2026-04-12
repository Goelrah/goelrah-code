import * as vscode from 'vscode';
import { getEditorContext, getDiagnostics, getWorkspaceContext, getGitDiff } from './context';

export interface SlashCommandResult {
  systemPrompt: string;
  userMessage: string;
}

export async function handleSlashCommand(
  command: string,
  userQuery: string,
): Promise<SlashCommandResult> {
  switch (command) {
    case 'explain': {
      const ctx = getEditorContext();
      const code = ctx?.selection?.text ?? ctx?.content ?? '';
      return {
        systemPrompt: 'You are a code explainer. Explain clearly and concisely.',
        userMessage: `Explain this ${ctx?.language ?? ''} code:\n\n\`\`\`${ctx?.language ?? ''}\n${code}\n\`\`\`${userQuery ? `\n\nSpecifically: ${userQuery}` : ''}`,
      };
    }

    case 'fix': {
      const ctx = getEditorContext();
      const diags = getDiagnostics();
      const code = ctx?.selection?.text ?? ctx?.content ?? '';
      const diagText = diags
        ? diags.diagnostics.map((d) => `Line ${d.range.startLine}: [${d.severity}] ${d.message}`).join('\n')
        : 'No diagnostics available';
      return {
        systemPrompt: 'You are a bug fixer. Identify the issue and provide corrected code.',
        userMessage: `Fix this ${ctx?.language ?? ''} code:\n\n\`\`\`${ctx?.language ?? ''}\n${code}\n\`\`\`\n\nDiagnostics:\n${diagText}${userQuery ? `\n\nAdditional context: ${userQuery}` : ''}`,
      };
    }

    case 'test': {
      const ctx = getEditorContext();
      const code = ctx?.selection?.text ?? ctx?.content ?? '';
      return {
        systemPrompt: 'You are a test engineer. Generate comprehensive tests.',
        userMessage: `Generate unit tests for this ${ctx?.language ?? ''} code. Cover happy path, edge cases, and error handling.\n\n\`\`\`${ctx?.language ?? ''}\n${code}\n\`\`\`${userQuery ? `\n\nFocus on: ${userQuery}` : ''}`,
      };
    }

    case 'review': {
      const ctx = getEditorContext();
      const diags = getDiagnostics();
      const code = ctx?.selection?.text ?? ctx?.content ?? '';
      return {
        systemPrompt: 'You are a senior code reviewer. Check for correctness, security, performance, and style.',
        userMessage: `Review this ${ctx?.language ?? ''} code:\n\n\`\`\`${ctx?.language ?? ''}\n${code}\n\`\`\`${diags ? `\n\nExisting diagnostics:\n${diags.diagnostics.map((d) => `- ${d.message}`).join('\n')}` : ''}${userQuery ? `\n\nFocus on: ${userQuery}` : ''}`,
      };
    }

    case 'commit': {
      const diff = await getGitDiff();
      if (!diff) {
        return {
          systemPrompt: '',
          userMessage: 'No git changes found. Stage some changes first.',
        };
      }
      return {
        systemPrompt: 'Generate a conventional commit message. Format: type(scope): description. Add body if complex.',
        userMessage: `Generate a commit message for this diff:\n\n\`\`\`diff\n${diff.slice(0, 8000)}\n\`\`\``,
      };
    }

    case 'askRepo': {
      const ws = await getWorkspaceContext();
      return {
        systemPrompt: 'You are a codebase expert. Answer questions about the project.',
        userMessage: `About project "${ws?.name ?? 'unknown'}" (${ws?.fileCount ?? 0} files${ws?.gitBranch ? `, branch: ${ws.gitBranch}` : ''}):\n\n${userQuery || 'Give me an overview of this project.'}`,
      };
    }

    default:
      return { systemPrompt: '', userMessage: userQuery };
  }
}
