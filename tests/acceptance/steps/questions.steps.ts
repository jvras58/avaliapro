import assert from "node:assert/strict";
import {
  Given,
  When,
  Then,
  Before,
  DataTable,
} from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import {
  listQuestions,
  createQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/domain/questions";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

Before(async function () {
  // Wipe all questions (cascade deletes alternatives) before each scenario
  await prisma.question.deleteMany();
});

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  "que o banco de dados está limpo",
  // The Before hook already wipes the DB before every scenario.
  // This step exists purely for readability in the feature file.
  function (this: AvaliaProWorld) {
    // intentional no-op
  }
);

Given(
  "que existe uma questão cadastrada com enunciado {string} e alternativas:",
  async function (
    this: AvaliaProWorld,
    statement: string,
    table: DataTable
  ) {
    const rows = table.hashes() as { descrição: string; "deve marcar": string }[];
    const alternatives = rows.map((r) => ({
      description: r["descrição"],
      shouldBeMarked: r["deve marcar"] === "true",
    }));
    this.currentQuestion = await createQuestion({ statement, alternatives });
  }
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  "eu solicito a listagem de questões",
  async function (this: AvaliaProWorld) {
    this.lastError = null;
    this.lastResponse = await listQuestions();
  }
);

When(
  "eu crio uma questão com os dados:",
  async function (this: AvaliaProWorld, table: DataTable) {
    // The table is a key-value layout: | enunciado | <value> |
    const raw = table.raw();
    const statementRow = raw.find((r) => r[0] === "enunciado");
    // Store temporarily on the world; the next step finishes the creation.
    this.pendingStatement = statementRow ? statementRow[1] : "";
  }
);

When(
  "adiciono as seguintes alternativas:",
  async function (this: AvaliaProWorld, table: DataTable) {
    const rows = table.hashes() as { descrição: string; "deve marcar": string }[];
    const alternatives = rows.map((r) => ({
      description: r["descrição"],
      shouldBeMarked: r["deve marcar"] === "true",
    }));
    this.lastError = null;
    try {
      this.currentQuestion = await createQuestion({
        statement: this.pendingStatement,
        alternatives,
      });
      this.lastResponse = this.currentQuestion;
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu busco a questão pelo seu id",
  async function (this: AvaliaProWorld) {
    this.lastError = null;
    this.lastResponse = await getQuestion(this.currentQuestion!.id);
  }
);

When(
  "eu busco a questão com id {string}",
  async function (this: AvaliaProWorld, id: string) {
    this.lastError = null;
    this.lastResponse = await getQuestion(id);
  }
);

When(
  "eu atualizo o enunciado da questão para {string}",
  async function (this: AvaliaProWorld, newStatement: string) {
    this.lastError = null;
    try {
      this.currentQuestion = await updateQuestion(this.currentQuestion!.id, {
        statement: newStatement,
      });
      this.lastResponse = this.currentQuestion;
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu atualizo as alternativas da questão para:",
  async function (this: AvaliaProWorld, table: DataTable) {
    const rows = table.hashes() as { descrição: string; "deve marcar": string }[];
    const alternatives = rows.map((r) => ({
      description: r["descrição"],
      shouldBeMarked: r["deve marcar"] === "true",
    }));
    this.lastError = null;
    try {
      this.currentQuestion = await updateQuestion(this.currentQuestion!.id, {
        alternatives,
      });
      this.lastResponse = this.currentQuestion;
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When("eu removo a questão", async function (this: AvaliaProWorld) {
  this.lastError = null;
  try {
    await deleteQuestion(this.currentQuestion!.id);
    this.currentQuestion = null;
  } catch (e) {
    this.lastError = e as Error;
  }
});

When(
  "eu tento criar uma questão sem enunciado e com alternativas:",
  async function (this: AvaliaProWorld, table: DataTable) {
    const rows = table.hashes() as { descrição: string; "deve marcar": string }[];
    const alternatives = rows.map((r) => ({
      description: r["descrição"],
      shouldBeMarked: r["deve marcar"] === "true",
    }));
    this.lastError = null;
    try {
      await createQuestion({ statement: "", alternatives });
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu tento criar uma questão com enunciado {string} e apenas 1 alternativa:",
  async function (this: AvaliaProWorld, statement: string, table: DataTable) {
    const rows = table.hashes() as { descrição: string; "deve marcar": string }[];
    const alternatives = rows.map((r) => ({
      description: r["descrição"],
      shouldBeMarked: r["deve marcar"] === "true",
    }));
    this.lastError = null;
    try {
      await createQuestion({ statement, alternatives });
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then("devo receber uma lista vazia", function (this: AvaliaProWorld) {
  const list = this.lastResponse as unknown[];
  assert.equal(list.length, 0, "Expected empty list");
});

Then(
  "a questão deve ser criada com sucesso",
  function (this: AvaliaProWorld) {
    assert.ok(this.currentQuestion, "Expected a created question");
    assert.ok(this.currentQuestion.id, "Expected question to have an id");
  }
);

Then(
  "a lista de questões deve conter {int} questão",
  async function (this: AvaliaProWorld, count: number) {
    const questions = await listQuestions();
    assert.equal(questions.length, count);
  }
);

Then(
  "a lista de questões deve conter {int} questões",
  async function (this: AvaliaProWorld, count: number) {
    const questions = await listQuestions();
    assert.equal(questions.length, count);
  }
);

Then(
  "devo receber a questão com o enunciado {string}",
  function (this: AvaliaProWorld, expectedStatement: string) {
    const q = this.lastResponse as { statement: string } | null;
    assert.ok(q, "Expected a question in the response");
    assert.equal(q.statement, expectedStatement);
  }
);

Then(
  "a questão deve ter {int} alternativas",
  function (this: AvaliaProWorld, count: number) {
    const q = (this.lastResponse ?? this.currentQuestion) as {
      alternatives: unknown[];
    } | null;
    assert.ok(q, "Expected a question");
    assert.equal(q.alternatives.length, count);
  }
);

Then(
  "a questão deve ter o enunciado {string}",
  function (this: AvaliaProWorld, expectedStatement: string) {
    assert.ok(this.currentQuestion, "Expected a current question");
    assert.equal(this.currentQuestion.statement, expectedStatement);
  }
);

Then(
  "uma das alternativas deve ser {string} marcada como correta",
  function (this: AvaliaProWorld, description: string) {
    const q = (this.lastResponse ?? this.currentQuestion) as {
      alternatives: { description: string; shouldBeMarked: boolean }[];
    } | null;
    assert.ok(q, "Expected a question");
    const match = q.alternatives.find(
      (a) => a.description === description && a.shouldBeMarked === true
    );
    assert.ok(
      match,
      `Expected alternative "${description}" to be marked as correct`
    );
  }
);

Then(
  "devo receber um erro de validação",
  function (this: AvaliaProWorld) {
    assert.ok(
      this.lastError,
      "Expected a validation error but none was thrown"
    );
  }
);

Then(
  "devo receber resposta de não encontrado",
  function (this: AvaliaProWorld) {
    assert.equal(
      this.lastResponse,
      null,
      "Expected null response for a non-existent question"
    );
  }
);
