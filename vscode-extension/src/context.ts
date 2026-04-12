import * as vscode from 'vscode';
import type { EditorContext, DiagnosticsContext, WorkspaceContext } from './types';

export function getEditorContext(): EditorContext | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;

  const doc = editor.document;
  const selection = editor.selection;
  const hasSelection = !selection.isEmpty;

  return {
    fileName: doc.fileName.split('/').pop() ?? doc.fileName,
    filePath: doc.uri.fsPath,
    language: doc.languageId,
    content: doc.getText(),
    selection: hasSelection
      ? {
          text: doc.getText(selection),
          startLine: selection.start.line + 1,
          endLine: selection.end.line + 1,
        }
      : undefined,
  };
}

export function getDiagnostics(): DiagnosticsContext | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;

  const diags = vscode.languages.getDiagnostics(editor.document.uri);
  if (diags.length === 0) return undefined;

  return {
    filePath: editor.document.uri.fsPath,
    diagnostics: diags.map((d) => ({
      message: d.message,
      severity: vscode.DiagnosticSeverity[d.severity],
      range: { startLine: d.range.start.line + 1, endLine: d.range.end.line + 1 },
      source: d.source,
    })),
  };
}

export async function getWorkspaceContext(): Promise<WorkspaceContext | undefined> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;

  const root = folders[0];
  let gitBranch: string | undefined;

  try {
    const gitExt = vscode.extensions.getExtension('vscode.git');
    if (gitExt?.isActive) {
      const git = gitExt.exports.getAPI(1);
      const repo = git.repositories[0];
      gitBranch = repo?.state?.HEAD?.name;
    }
  } catch { /* no git */ }

  const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 1000);

  return {
    name: root.name,
    rootPath: root.uri.fsPath,
    fileCount: files.length,
    gitBranch,
  };
}

export async function getGitDiff(): Promise<string | undefined> {
  try {
    const gitExt = vscode.extensions.getExtension('vscode.git');
    if (!gitExt?.isActive) return undefined;
    const git = gitExt.exports.getAPI(1);
    const repo = git.repositories[0];
    if (!repo) return undefined;
    const diff = await repo.diff(true); // staged
    return diff || await repo.diff(false); // unstaged fallback
  } catch {
    return undefined;
  }
}
