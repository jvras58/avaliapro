/**
 * Regression steps for data consistency after mutations.
 *
 * These steps call domain functions directly to verify that a write is
 * immediately visible in the next read — i.e., that no layer (in-memory
 * cache, HTTP cache, or stale TanStack Query cache) hides a mutation.
 */
import assert from "node:assert/strict";
import { Given, When, Then, Before } from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import { createQuestion, listQuestions, deleteQuestion } from "@/domain/questions";
import { createExam, listExams, deleteExam } from "@/domain/exams";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Hooks — isolated DB state for this feature
// ---------------------------------------------------------------------------

Before({ tags: "@consistency or not @tagged" }, async function () {
  // no-op: the Before in questions.steps.ts already wipes questions before each scenario,
  // but we need to also wipe exams for the exam scenarios here.
});

Before(async function () {
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
});

// ---------------------------------------------------------------------------
// Shared state for this step file
// ---------------------------------------------------------------------------

let _consistencyQuestion: import("@/domain/types").Question | null = null;
let _consistencyExam: import("@/domain/types").Exam | null = null;
let _questionList: import("@/domain/types").Question[] = [];
let _examList: import("@/domain/types").Exam[] = [];

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  "que o banco de dados está limpo para consistência",
  function (this: AvaliaProWorld) {
    _consistencyQuestion = null;
    _consistencyExam = null;
    _questionList = [];
    _examList = [];
  }
);

Given(
  "que existe uma questão de consistência com enunciado {string}",
  async function (this: AvaliaProWorld, statement: string) {
    _consistencyQuestion = await createQuestion({
      statement,
      alternatives: [
        { description: "Opção A", shouldBeMarked: true },
        { description: "Opção B", shouldBeMarked: false },
      ],
    });
  }
);

Given(
  "existe um exame de consistência com título {string}",
  async function (this: AvaliaProWorld, title: string) {
    assert.ok(_consistencyQuestion, "Need a question before creating an exam");
    _consistencyExam = await createExam({
      title,
      identificationMode: "letters",
      questionIds: [_consistencyQuestion.id],
    });
  }
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  "eu crio uma questão via domínio com enunciado {string}",
  async function (this: AvaliaProWorld, statement: string) {
    _consistencyQuestion = await createQuestion({
      statement,
      alternatives: [
        { description: "Sim", shouldBeMarked: true },
        { description: "Não", shouldBeMarked: false },
      ],
    });
    // Immediately read back — simulates the refetch after invalidation
    _questionList = await listQuestions();
  }
);

When(
  "eu removo essa questão via domínio",
  async function (this: AvaliaProWorld) {
    assert.ok(_consistencyQuestion, "No question to delete");
    await deleteQuestion(_consistencyQuestion.id);
    _questionList = await listQuestions();
  }
);

When(
  "eu crio um exame via domínio com título {string}",
  async function (this: AvaliaProWorld, title: string) {
    assert.ok(_consistencyQuestion, "Need a question before creating an exam");
    _consistencyExam = await createExam({
      title,
      identificationMode: "letters",
      questionIds: [_consistencyQuestion.id],
    });
    _examList = await listExams();
  }
);

When(
  "eu removo esse exame via domínio",
  async function (this: AvaliaProWorld) {
    assert.ok(_consistencyExam, "No exam to delete");
    await deleteExam(_consistencyExam.id);
    _examList = await listExams();
  }
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  /^a listagem de questões via domínio deve conter (\d+) itens$/,
  function (this: AvaliaProWorld, expectedCount: string) {
    assert.equal(
      _questionList.length,
      Number(expectedCount),
      `Expected ${expectedCount} question(s) but got ${_questionList.length}`
    );
  }
);

Then(
  "o primeiro item da listagem deve ter enunciado {string}",
  function (this: AvaliaProWorld, expectedStatement: string) {
    assert.ok(_questionList.length > 0, "Question list is empty");
    assert.equal(_questionList[0].statement, expectedStatement);
  }
);

Then(
  /^a listagem de exames via domínio deve conter (\d+) itens$/,
  function (this: AvaliaProWorld, expectedCount: string) {
    assert.equal(
      _examList.length,
      Number(expectedCount),
      `Expected ${expectedCount} exam(s) but got ${_examList.length}`
    );
  }
);

Then(
  "o primeiro exame da listagem deve ter título {string}",
  function (this: AvaliaProWorld, expectedTitle: string) {
    assert.ok(_examList.length > 0, "Exam list is empty");
    assert.equal(_examList[0].title, expectedTitle);
  }
);
