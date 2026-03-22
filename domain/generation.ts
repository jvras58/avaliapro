import type {
  Exam,
  GeneratedExam,
  ShuffledQuestion,
  AnswerKeyRow,
  GenerationResult,
  ShuffledAlternative,
} from "@/domain/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Returns letters A, B, C, … for index 0, 1, 2, … */
function indexToLetter(i: number): string {
  return String.fromCharCode(65 + i);
}

/** Returns power of 2 for index 0, 1, 2, … → 1, 2, 4, 8, … */
function indexToPowerOf2(i: number): number {
  return Math.pow(2, i);
}

// ---------------------------------------------------------------------------
// Answer key calculation for a single question
// ---------------------------------------------------------------------------

function computeAnswer(
  alternatives: ShuffledAlternative[],
  mode: Exam["identificationMode"]
): string {
  if (mode === "letters") {
    const letters = alternatives
      .map((a, i) => (a.shouldBeMarked ? indexToLetter(i) : null))
      .filter((l): l is string => l !== null);
    return letters.join("") || "-";
  } else {
    const sum = alternatives.reduce(
      (acc, a, i) => acc + (a.shouldBeMarked ? indexToPowerOf2(i) : 0),
      0
    );
    return String(sum);
  }
}

// ---------------------------------------------------------------------------
// CSV serialisation
// ---------------------------------------------------------------------------

function buildCsv(rows: AnswerKeyRow[], questionCount: number): string {
  const header = [
    "exam_number",
    ...Array.from({ length: questionCount }, (_, i) => `q${i + 1}`),
  ].join(",");

  const dataRows = rows.map((r) =>
    [r.examNumber, ...r.answers].join(",")
  );

  return [header, ...dataRows].join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateExams(exam: Exam, count: number): GenerationResult {
  if (count < 1) throw new Error("Number of exams must be at least 1.");

  const answerKeyRows: AnswerKeyRow[] = [];
  const generatedExams: GeneratedExam[] = [];

  const baseQuestions = exam.questions
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((eq) => eq.question);

  for (let n = 1; n <= count; n++) {
    const shuffledQuestions: ShuffledQuestion[] = shuffle(baseQuestions).map(
      (q) => {
        const shuffledAlts: ShuffledAlternative[] = shuffle(
          q.alternatives
        ).map((a) => ({
          description: a.description,
          shouldBeMarked: a.shouldBeMarked,
        }));
        return {
          originalId: q.id,
          statement: q.statement,
          alternatives: shuffledAlts,
        };
      }
    );

    const answers = shuffledQuestions.map((q) =>
      computeAnswer(q.alternatives, exam.identificationMode)
    );

    answerKeyRows.push({ examNumber: n, answers });

    generatedExams.push({
      examNumber: n,
      title: exam.title,
      course: exam.course,
      instructor: exam.instructor,
      date: exam.date,
      identificationMode: exam.identificationMode,
      questions: shuffledQuestions,
    });
  }

  const questionCount = baseQuestions.length;
  const answerKeyCsv = buildCsv(answerKeyRows, questionCount);

  return { exams: generatedExams, answerKeyCsv };
}
