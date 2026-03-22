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

// ---------------------------------------------------------------------------
// Exam types
// ---------------------------------------------------------------------------

export type IdentificationMode = "letters" | "powers_of_2";

export interface ExamQuestion {
  id: string;
  examId: string;
  questionId: string;
  position: number;
  question: Question;
}

export interface Exam {
  id: string;
  title: string;
  course: string;
  instructor: string;
  date: string;
  identificationMode: IdentificationMode;
  questions: ExamQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExamInput {
  title: string;
  course?: string;
  instructor?: string;
  date?: string;
  identificationMode: IdentificationMode;
  questionIds: string[];
}

export interface UpdateExamInput {
  title?: string;
  course?: string;
  instructor?: string;
  date?: string;
  identificationMode?: IdentificationMode;
  questionIds?: string[];
}

// ---------------------------------------------------------------------------
// Generation types
// ---------------------------------------------------------------------------

export interface ShuffledAlternative {
  description: string;
  shouldBeMarked: boolean;
}

export interface ShuffledQuestion {
  originalId: string;
  statement: string;
  alternatives: ShuffledAlternative[];
}

export interface GeneratedExam {
  examNumber: number;
  title: string;
  course: string;
  instructor: string;
  date: string;
  identificationMode: IdentificationMode;
  questions: ShuffledQuestion[];
}

export interface AnswerKeyRow {
  examNumber: number;
  /** One answer string per question, in question order */
  answers: string[];
}

export interface GenerationResult {
  exams: GeneratedExam[];
  answerKeyCsv: string;
}

// ---------------------------------------------------------------------------
// Grading types
// ---------------------------------------------------------------------------

export type GradingMode = "strict" | "lenient";

/** One row from the students' answers CSV */
export interface StudentAnswerRow {
  studentId: string;
  examNumber: number;
  /** Raw answer string per question, in question order */
  answers: string[];
}

export interface QuestionScore {
  questionIndex: number;
  score: number;
  maxScore: number;
}

export interface StudentGrade {
  studentId: string;
  examNumber: number;
  questionScores: QuestionScore[];
  total: number;
  maxTotal: number;
}

export interface GradingReport {
  grades: StudentGrade[];
  average: number;
  min: number;
  max: number;
}
