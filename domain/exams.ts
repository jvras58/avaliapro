import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  Exam,
  IdentificationMode,
  CreateExamInput,
  UpdateExamInput,
} from "@/domain/types";

function isNotFoundError(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025"
  );
}

// SQLite stores identificationMode as a plain string; cast it to our union.
function toExam(raw: Record<string, unknown> & { identificationMode: string }): Exam {
  return { ...raw, identificationMode: raw.identificationMode as IdentificationMode } as Exam;
}

const includeQuestions = {
  questions: {
    include: { question: { include: { alternatives: true } } },
    orderBy: { position: "asc" as const },
  },
} as const;

export async function listExams(): Promise<Exam[]> {
  const rows = await prisma.exam.findMany({
    include: includeQuestions,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toExam);
}

export async function getExam(id: string): Promise<Exam | null> {
  const row = await prisma.exam.findUnique({ where: { id }, include: includeQuestions });
  return row ? toExam(row) : null;
}

export async function createExam(input: CreateExamInput): Promise<Exam> {
  if (!input.title.trim()) throw new Error("Exam title must not be empty.");
  if (input.questionIds.length === 0)
    throw new Error("An exam must have at least one question.");

  const row = await prisma.exam.create({
    data: {
      title: input.title.trim(),
      course: input.course?.trim() ?? "",
      instructor: input.instructor?.trim() ?? "",
      date: input.date?.trim() ?? "",
      identificationMode: input.identificationMode,
      questions: {
        create: input.questionIds.map((questionId, position) => ({
          questionId,
          position,
        })),
      },
    },
    include: includeQuestions,
  });
  return toExam(row);
}

export async function updateExam(
  id: string,
  input: UpdateExamInput
): Promise<Exam> {
  if (input.title !== undefined && !input.title.trim())
    throw new Error("Exam title must not be empty.");
  if (input.questionIds !== undefined && input.questionIds.length === 0)
    throw new Error("An exam must have at least one question.");

  try {
    const row = await prisma.exam.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.course !== undefined && { course: input.course.trim() }),
        ...(input.instructor !== undefined && {
          instructor: input.instructor.trim(),
        }),
        ...(input.date !== undefined && { date: input.date.trim() }),
        ...(input.identificationMode !== undefined && {
          identificationMode: input.identificationMode,
        }),
        ...(input.questionIds !== undefined && {
          questions: {
            deleteMany: {},
            create: input.questionIds.map((questionId, position) => ({
              questionId,
              position,
            })),
          },
        }),
      },
      include: includeQuestions,
    });
    return toExam(row);
  } catch (e) {
    if (isNotFoundError(e)) throw new Error("Exam not found.");
    throw e;
  }
}

export async function deleteExam(id: string): Promise<void> {
  try {
    await prisma.exam.delete({ where: { id } });
  } catch (e) {
    if (isNotFoundError(e)) throw new Error("Exam not found.");
    throw e;
  }
}
