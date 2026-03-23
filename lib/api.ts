/**
 * Thin API fetcher functions for use with TanStack Query.
 * Each function maps to a Route Handler under app/api/.
 */
import type {
  Question,
  Exam,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateExamInput,
  UpdateExamInput,
} from "@/domain/types";

// ---------------------------------------------------------------------------
// Query keys (centralised so mutations can invalidate consistently)
// ---------------------------------------------------------------------------

export const queryKeys = {
  questions: ["questions"] as const,
  question: (id: string) => ["questions", id] as const,
  exams: ["exams"] as const,
  exam: (id: string) => ["exams", id] as const,
};

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch("/api/questions", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function fetchQuestion(id: string): Promise<Question> {
  const res = await fetch(`/api/questions/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<Question> {
  const res = await fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create question");
  }
  return res.json();
}

export async function updateQuestion(
  id: string,
  input: UpdateQuestionInput
): Promise<Question> {
  const res = await fetch(`/api/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to update question");
  }
  return res.json();
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete question");
}

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

export async function fetchExams(): Promise<Exam[]> {
  const res = await fetch("/api/exams", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch exams");
  return res.json();
}

export async function fetchExam(id: string): Promise<Exam> {
  const res = await fetch(`/api/exams/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch exam");
  return res.json();
}

export async function createExamApi(input: CreateExamInput): Promise<Exam> {
  const res = await fetch("/api/exams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create exam");
  }
  return res.json();
}

export async function updateExamApi(
  id: string,
  input: UpdateExamInput
): Promise<Exam> {
  const res = await fetch(`/api/exams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to update exam");
  }
  return res.json();
}

export async function deleteExam(id: string): Promise<void> {
  const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete exam");
}
