// ---------------------------------------------------------------------------
// Shared domain types — used by both backend (API handlers) and frontend.
// ---------------------------------------------------------------------------

export interface Alternative {
  id: string;
  description: string;
  shouldBeMarked: boolean;
  questionId: string;
}

export interface Question {
  id: string;
  statement: string;
  alternatives: Alternative[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types (used for create / update operations)
// ---------------------------------------------------------------------------

export interface AlternativeInput {
  description: string;
  shouldBeMarked: boolean;
}

export interface CreateQuestionInput {
  statement: string;
  alternatives: AlternativeInput[];
}

export interface UpdateQuestionInput {
  statement?: string;
  alternatives?: AlternativeInput[];
}
