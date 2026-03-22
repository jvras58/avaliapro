import assert from "node:assert/strict";
import { Given, When, Then, Before, DataTable } from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import {
  listExams,
  createExam,
  getExam,
  updateExam,
  deleteExam,
} from "@/domain/exams";
import { createQuestion } from "@/domain/questions";
import { prisma } from "@/lib/prisma";
import type { IdentificationMode } from "@/domain/types";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

Before(async function () {
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
});

// ---------------------------------------------------------------------------
// Shared Given — re-used across feature files
// ---------------------------------------------------------------------------

Given(
  "que existem questões cadastradas:",
  async function (this: AvaliaProWorld, table: DataTable) {
    const rows = table.hashes() as { enunciado: string }[];
    for (const row of rows) {
      await createQuestion({
        statement: row["enunciado"],
        alternatives: [
          { description: "Opção A", shouldBeMarked: true },
          { description: "Opção B", shouldBeMarked: false },
        ],
      });
    }
  }
);

Given(
  "que existe uma prova cadastrada com título {string} no modo {string}",
  async function (
    this: AvaliaProWorld,
    title: string,
    mode: IdentificationMode
  ) {
    const question = await createQuestion({
      statement: "Questão de apoio",
      alternatives: [
        { description: "Sim", shouldBeMarked: true },
        { description: "Não", shouldBeMarked: false },
      ],
    });
    this.currentExam = await createExam({
      title,
      identificationMode: mode,
      questionIds: [question.id],
    });
  }
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  "eu solicito a listagem de provas",
  async function (this: AvaliaProWorld) {
    this.lastError = null;
    this.lastExamResponse = await listExams();
  }
);

When(
  "eu crio uma prova com os dados:",
  async function (this: AvaliaProWorld, table: DataTable) {
    // key-value table layout: | campo | valor |
    const raw = table.raw();
    const get = (key: string) =>
      (raw.find((r) => r[0] === key) ?? [key, ""])[1];

    const title = get("título");
    const mode = get("modo de identificação") as IdentificationMode;

    // Use all currently persisted questions
    const questions = await prisma.question.findMany();
    this.lastError = null;
    try {
      this.currentExam = await createExam({
        title,
        course: get("curso"),
        identificationMode: mode,
        questionIds: questions.map((q) => q.id),
      });
      this.lastExamResponse = this.currentExam;
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu busco a prova pelo seu id",
  async function (this: AvaliaProWorld) {
    this.lastError = null;
    this.lastExamResponse = await getExam(this.currentExam!.id);
  }
);

When(
  "eu busco a prova com id {string}",
  async function (this: AvaliaProWorld, id: string) {
    this.lastError = null;
    this.lastExamResponse = await getExam(id);
  }
);

When(
  "eu atualizo o título da prova para {string}",
  async function (this: AvaliaProWorld, newTitle: string) {
    this.lastError = null;
    try {
      this.currentExam = await updateExam(this.currentExam!.id, {
        title: newTitle,
      });
      this.lastExamResponse = this.currentExam;
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu atualizo o modo de identificação da prova para {string}",
  async function (this: AvaliaProWorld, mode: string) {
    this.lastError = null;
    try {
      this.currentExam = await updateExam(this.currentExam!.id, {
        identificationMode: mode as IdentificationMode,
      });
      this.lastExamResponse = this.currentExam;
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When("eu removo a prova", async function (this: AvaliaProWorld) {
  this.lastError = null;
  try {
    await deleteExam(this.currentExam!.id);
    this.currentExam = null;
  } catch (e) {
    this.lastError = e as Error;
  }
});

When(
  "eu tento criar uma prova sem título",
  async function (this: AvaliaProWorld) {
    const questions = await prisma.question.findMany();
    this.lastError = null;
    try {
      await createExam({
        title: "",
        identificationMode: "letters",
        questionIds: questions.map((q) => q.id),
      });
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu tento criar uma prova sem questões com título {string}",
  async function (this: AvaliaProWorld, title: string) {
    this.lastError = null;
    try {
      await createExam({ title, identificationMode: "letters", questionIds: [] });
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  "devo receber uma lista de provas vazia",
  function (this: AvaliaProWorld) {
    const list = this.lastExamResponse as unknown[];
    assert.equal(list.length, 0);
  }
);

Then(
  "a prova deve ser criada com sucesso",
  function (this: AvaliaProWorld) {
    assert.ok(this.currentExam, "Expected a created exam");
    assert.ok(this.currentExam.id, "Expected exam to have an id");
  }
);

Then(
  "a lista de provas deve conter {int} prova",
  async function (this: AvaliaProWorld, count: number) {
    const exams = await listExams();
    assert.equal(exams.length, count);
  }
);

Then(
  "a lista de provas deve conter {int} provas",
  async function (this: AvaliaProWorld, count: number) {
    const exams = await listExams();
    assert.equal(exams.length, count);
  }
);

Then(
  "devo receber a prova com o título {string}",
  function (this: AvaliaProWorld, expectedTitle: string) {
    const exam = this.lastExamResponse as { title: string } | null;
    assert.ok(exam, "Expected an exam in the response");
    assert.equal(exam.title, expectedTitle);
  }
);

Then(
  "a prova deve ter o título {string}",
  function (this: AvaliaProWorld, expectedTitle: string) {
    assert.ok(this.currentExam, "Expected a current exam");
    assert.equal(this.currentExam.title, expectedTitle);
  }
);

Then(
  "a prova deve ter o modo de identificação {string}",
  function (this: AvaliaProWorld, expectedMode: string) {
    const exam = this.currentExam ?? (this.lastExamResponse as { identificationMode: string } | null);
    assert.ok(exam, "Expected an exam");
    assert.equal(exam.identificationMode, expectedMode);
  }
);

Then(
  "devo receber prova não encontrada",
  function (this: AvaliaProWorld) {
    assert.equal(
      this.lastExamResponse,
      null,
      "Expected null for a non-existent exam"
    );
  }
);
