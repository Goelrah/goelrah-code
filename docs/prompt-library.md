# Rahul Goel AI Studio — Prompt Library Reference

## Overview

The prompt library provides pre-built templates for common coding tasks. Each prompt has placeholder inputs (`{{variable}}`) that get filled in before sending to the model.

## Categories

| Category | Count | Purpose |
|----------|-------|---------|
| general | 2 | General coding questions and how-to guides |
| explain | 5 | Code explanation, repo understanding, error interpretation |
| fix | 3 | Bug diagnosis, quick fixes, triage |
| refactor | 3 | Code cleanup, performance, modularization |
| test | 3 | Unit tests, integration tests, test case planning |
| docs | 3 | Function docs, README generation, API documentation |
| commit | 2 | Conventional commits, PR descriptions |
| review | 2 | Full and quick code reviews |
| security | 3 | Security audits, vulnerability fixes, input validation |

## Prompt Details

### General Coding Help
- **Name:** General Coding Help
- **Purpose:** Open-ended coding questions
- **Inputs:** `question`
- **Output:** Direct answer with code examples
- **Risk:** Model may hallucinate APIs or library methods. Verify against docs.
- **Example:** "How do I implement a debounce function in TypeScript?"

### How Do I...
- **Name:** How Do I...
- **Purpose:** Step-by-step task guidance
- **Inputs:** `task`, `language/framework`
- **Output:** Numbered steps with code
- **Risk:** Steps may be outdated for rapidly evolving frameworks.
- **Example:** task="set up authentication", language="Next.js 14"

### Explain Repository
- **Name:** Explain Repository
- **Purpose:** Understand a codebase from its file structure
- **Inputs:** `structure` (file tree)
- **Output:** Project overview, tech stack, architecture
- **Risk:** Without file contents, analysis is surface-level.
- **Example:** Paste output of `tree -L 3`

### Explain Code
- **Name:** Explain Code
- **Purpose:** Line-by-line code walkthrough
- **Inputs:** `code`, `language`
- **Output:** Detailed explanation of each section
- **Risk:** None significant.

### Explain Error
- **Name:** Explain Error
- **Purpose:** Decode error messages
- **Inputs:** `error`, `code`, `language`
- **Output:** Root cause + fix
- **Risk:** Error context may be incomplete without full stack trace.

### Diagnose Bug
- **Name:** Diagnose Bug
- **Purpose:** Find bugs with expected vs actual behavior
- **Inputs:** `code`, `language`, `expected`, `actual`
- **Output:** Bug identification + corrected code
- **Risk:** May miss bugs that depend on runtime state or external systems.

### Quick Fix
- **Name:** Quick Fix
- **Purpose:** Fix code with a known error
- **Inputs:** `code`, `error`, `language`
- **Output:** Fixed code
- **Risk:** Fix may address symptom, not root cause.

### Bug Triage
- **Name:** Bug Triage
- **Purpose:** Assess bug severity and plan investigation
- **Inputs:** `report`
- **Output:** Severity assessment, hypotheses, investigation steps
- **Risk:** Triage accuracy depends on report quality.

### Clean Up Code
- **Name:** Clean Up Code
- **Purpose:** Improve readability without changing behavior
- **Inputs:** `code`, `language`
- **Output:** Refactored code with explanations
- **Risk:** Refactoring may subtly change behavior. Test after applying.

### Optimize Performance
- **Name:** Optimize Performance
- **Purpose:** Find and fix performance bottlenecks
- **Inputs:** `code`, `language`
- **Output:** Optimized code with rationale
- **Risk:** Premature optimization. Profile first in real workloads.

### Generate Unit Tests
- **Name:** Generate Unit Tests
- **Purpose:** Comprehensive test coverage
- **Inputs:** `code`, `language`, `framework`
- **Output:** Test file with happy path, edge cases, error handling
- **Risk:** Generated tests may have false assertions. Review before trusting.

### Full Code Review
- **Name:** Full Code Review
- **Purpose:** Thorough multi-dimensional review
- **Inputs:** `code`, `language`
- **Output:** Categorized feedback (correctness, security, performance, style)
- **Risk:** May miss context-dependent issues.

### Security Audit
- **Name:** Security Audit
- **Purpose:** OWASP-style vulnerability check
- **Inputs:** `code`, `language`
- **Output:** Vulnerability list with severity and fixes
- **Risk:** Cannot detect all vulnerabilities. Not a replacement for professional pen testing.

### Conventional Commit
- **Name:** Conventional Commit
- **Purpose:** Generate commit messages from diffs
- **Inputs:** `diff`
- **Output:** `type(scope): description` format
- **Risk:** May misidentify the scope or type. Review before committing.

## Adding Custom Prompts

Edit `src/data/prompts.ts` to add new prompts. Each prompt needs:

```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  category: 'category',
  description: 'One-line description',
  content: 'Prompt text with {{placeholders}}',
  inputs: ['placeholder1', 'placeholder2'],
  tags: ['tag1', 'tag2'],
}
```

## Usage in the App

1. Go to Prompts page
2. Click a prompt to expand it
3. Click "Use in Chat →" to open a new session with the prompt
4. Replace `{{placeholders}}` with your actual content
5. Send
