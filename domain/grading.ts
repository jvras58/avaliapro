import type {
  AnswerKeyRow,
  StudentAnswerRow,
  StudentGrade,
  QuestionScore,
  GradingReport,
  GradingMode,
} from "@/domain/types";

// ---------------------------------------------------------------------------
// CSV parsing helpers
// ---------------------------------------------------------------------------

export function parseAnswerKeyCsv(csv: string): AnswerKeyRow[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  // Skip header row (first line)
  return lines.slice(1).map((line) => {
    const [examNumberStr, ...answers] = line.split(",");
    return { examNumber: Number(examNumberStr), answers };
  });
}

export function parseStudentAnswersCsv(csv: string): StudentAnswerRow[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  // Expected header: student_id, exam_number, q1, q2, …
  return lines.slice(1).map((line) => {
    const [studentId, examNumberStr, ...answers] = line.split(",");
    return {
      studentId: studentId.trim(),
      examNumber: Number(examNumberStr),
      answers: answers.map((a) => a.trim()),
    };
  });
}

// ---------------------------------------------------------------------------
// Answer comparison
// ---------------------------------------------------------------------------

/**
 * Compares two answer strings in letters mode.
 * "ABC" and "BAC" are equivalent (order-insensitive).
 */
function normaliseLetters(answer: string): Set<string> {
  return new Set(answer.toUpperCase().split("").filter((c) => /[A-Z]/.test(c)));
}

/**
 * Strict grading for a single question:
 * The student's answer must exactly match the key (same set of letters or
 * same numeric sum). Any mismatch → 0.
 */
function gradeStrict(key: string, student: string): number {
  const k = key.trim();
  const s = student.trim();
  if (/^\d+$/.test(k)) {
    // Powers-of-2 mode: numeric comparison
    return k === s ? 1 : 0;
  }
  // Letters mode: set comparison
  const keySet = normaliseLetters(k);
  const studentSet = normaliseLetters(s);
  if (keySet.size !== studentSet.size) return 0;
  for (const letter of keySet) {
    if (!studentSet.has(letter)) return 0;
  }
  return 1;
}

/**
 * Lenient grading for a single question (letters mode):
 * Score = (correctly marked + correctly NOT marked) / totalAlternatives.
 *
 * For powers-of-2 mode, falls back to strict (partial credit is ambiguous
 * with numeric sums without knowing the full alternative set).
 */
function gradeLenient(key: string, student: string): number {
  const k = key.trim();
  const s = student.trim();

  if (/^\d+$/.test(k)) {
    // Powers-of-2: no meaningful partial credit without the full set
    return k === s ? 1 : 0;
  }

  // Derive the total alternative count from the answer key.
  // We use the highest letter present in the key or student answer to infer.
  const allLetters = new Set([
    ...normaliseLetters(k),
    ...normaliseLetters(s),
  ]);
  if (allLetters.size === 0) return 1; // both empty = correct

  const maxCode = Math.max(...[...allLetters].map((c) => c.charCodeAt(0)));
  const total = maxCode - 64; // 'A' is 65 → index 1

  const keySet = normaliseLetters(k);
  const studentSet = normaliseLetters(s);

  let correct = 0;
  for (let i = 0; i < total; i++) {
    const letter = String.fromCharCode(65 + i);
    const inKey = keySet.has(letter);
    const inStudent = studentSet.has(letter);
    if (inKey === inStudent) correct++;
  }

  return correct / total;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function gradeExams(
  answerKeyRows: AnswerKeyRow[],
  studentRows: StudentAnswerRow[],
  mode: GradingMode,
  pointsPerQuestion = 1
): GradingReport {
  const keyMap = new Map<number, string[]>(
    answerKeyRows.map((r) => [r.examNumber, r.answers])
  );

  const grades: StudentGrade[] = studentRows.map((student) => {
    const keyAnswers = keyMap.get(student.examNumber) ?? [];
    const questionCount = keyAnswers.length;

    const questionScores: QuestionScore[] = Array.from(
      { length: questionCount },
      (_, i) => {
        const key = keyAnswers[i] ?? "";
        const answer = student.answers[i] ?? "";
        const rawScore =
          mode === "strict"
            ? gradeStrict(key, answer)
            : gradeLenient(key, answer);
        return {
          questionIndex: i,
          score: rawScore * pointsPerQuestion,
          maxScore: pointsPerQuestion,
        };
      }
    );

    const total = questionScores.reduce((sum, q) => sum + q.score, 0);
    const maxTotal = questionCount * pointsPerQuestion;

    return {
      studentId: student.studentId,
      examNumber: student.examNumber,
      questionScores,
      total,
      maxTotal,
    };
  });

  const totals = grades.map((g) => g.total);
  const average =
    totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const min = totals.length > 0 ? Math.min(...totals) : 0;
  const max = totals.length > 0 ? Math.max(...totals) : 0;

  return { grades, average, min, max };
}
