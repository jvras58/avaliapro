import { prisma } from "@/lib/prisma";
import type {
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "@/domain/types";

const includeAlternatives = { alternatives: true } as const;

export async function listQuestions(): Promise<Question[]> {
  return prisma.question.findMany({
    include: includeAlternatives,
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuestion(id: string): Promise<Question | null> {
  return prisma.question.findUnique({
    where: { id },
    include: includeAlternatives,
  });
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<Question> {
  if (!input.statement.trim()) {
    throw new Error("Question statement must not be empty.");
  }
  if (input.alternatives.length < 2) {
    throw new Error("A question must have at least 2 alternatives.");
  }

  return prisma.question.create({
    data: {
      statement: input.statement.trim(),
      alternatives: {
        create: input.alternatives.map((a) => ({
          description: a.description.trim(),
          shouldBeMarked: a.shouldBeMarked,
        })),
      },
    },
    include: includeAlternatives,
  });
}

export async function updateQuestion(
  id: string,
  input: UpdateQuestionInput
): Promise<Question> {
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) throw new Error("Question not found.");

  return prisma.question.update({
    where: { id },
    data: {
      ...(input.statement !== undefined && {
        statement: input.statement.trim(),
      }),
      ...(input.alternatives !== undefined && {
        alternatives: {
          // Replace all alternatives: delete existing, create new ones.
          deleteMany: {},
          create: input.alternatives.map((a) => ({
            description: a.description.trim(),
            shouldBeMarked: a.shouldBeMarked,
          })),
        },
      }),
    },
    include: includeAlternatives,
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) throw new Error("Question not found.");

  // Alternatives are deleted via onDelete: Cascade in the schema.
  await prisma.question.delete({ where: { id } });
}
