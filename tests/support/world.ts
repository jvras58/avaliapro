import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { Question, Exam, GradingReport, GenerationResult } from "@/domain/types";

export interface AvaliaProWorld extends World {
  // ---- Questions ----
  currentQuestion: Question | null;
  lastResponse: Question | Question[] | null;
  lastError: Error | null;
  pendingStatement: string;

  // ---- Exams ----
  currentExam: Exam | null;
  lastExamResponse: Exam | Exam[] | null;

  // ---- Generation ----
  lastGenerationResult: GenerationResult | null;

  // ---- Grading ----
  lastAnswerKeyCsv: string;
  lastStudentAnswersCsv: string;
  lastGradingReport: GradingReport | null;
}

class AvaliaProWorldImpl extends World implements AvaliaProWorld {
  currentQuestion: Question | null = null;
  lastResponse: Question | Question[] | null = null;
  lastError: Error | null = null;
  pendingStatement: string = "";

  currentExam: Exam | null = null;
  lastExamResponse: Exam | Exam[] | null = null;

  lastGenerationResult: GenerationResult | null = null;

  lastAnswerKeyCsv: string = "";
  lastStudentAnswersCsv: string = "";
  lastGradingReport: GradingReport | null = null;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(AvaliaProWorldImpl);
