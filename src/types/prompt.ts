export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  content: string;
  inputs: string[];
  tags: string[];
}

export type PromptCategory =
  | 'general'
  | 'explain'
  | 'fix'
  | 'test'
  | 'review'
  | 'commit'
  | 'docs'
  | 'security'
  | 'refactor';
