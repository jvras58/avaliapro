import assert from "node:assert/strict";
import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import { createExam } from "@/domain/exams";
import { createQuestion } from "@/domain/questions";
import { generateExams } from "@/domain/generation";
import type { IdentificationMode } from "@/domain/types";

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  "que existe uma prova no modo {string} com as seguintes questões:",
  async function (
    this: AvaliaProWorld,
    mode: IdentificationMode,
    table: DataTable
  ) {
    const rows = table.hashes() as {
      enunciado: string;
      "alternativas corretas": string;
    }[];

    const questionIds: string[] = [];
    for (const row of rows) {
      const q = await createQuestion({
        statement: row["enunciado"],
        alternatives: [
          { description: row["alternativas corretas"], shouldBeMarked: true },
          { description: "Opção distratora", shouldBeMarked: false },
        ],
      });
      questionIds.push(q.id);
    }

    this.currentExam = await createExam({
      title: "Prova de Geração",
      identificationMode: mode,
      questionIds,
    });
  }
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  "eu gero {int} versão da prova",
  function (this: AvaliaProWorld, count: number) {
    this.lastError = null;
    try {
      this.lastGenerationResult = generateExams(this.currentExam!, count);
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu gero {int} versões da prova",
  function (this: AvaliaProWorld, count: number) {
    this.lastError = null;
    try {
      this.lastGenerationResult = generateExams(this.currentExam!, count);
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu tento gerar {int} versões da prova",
  function (this: AvaliaProWorld, count: number) {
    this.lastError = null;
    try {
      this.lastGenerationResult = generateExams(this.currentExam!, count);
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  "devo receber {int} prova gerada",
  function (this: AvaliaProWorld, count: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    assert.equal(this.lastGenerationResult.exams.length, count);
  }
);

Then(
  "devo receber {int} provas geradas",
  function (this: AvaliaProWorld, count: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    assert.equal(this.lastGenerationResult.exams.length, count);
  }
);

Then(
  "o CSV da chave de respostas deve ter {int} linha de dados",
  function (this: AvaliaProWorld, count: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    const lines = this.lastGenerationResult.answerKeyCsv
      .trim()
      .split("\n")
      .filter(Boolean);
    // First line is header, rest are data
    assert.equal(lines.length - 1, count);
  }
);

Then(
  "o CSV da chave de respostas deve ter {int} linhas de dados",
  function (this: AvaliaProWorld, count: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    const lines = this.lastGenerationResult.answerKeyCsv
      .trim()
      .split("\n")
      .filter(Boolean);
    assert.equal(lines.length - 1, count);
  }
);

Then(
  "o CSV deve conter as colunas {string}",
  function (this: AvaliaProWorld, expectedHeader: string) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    const firstLine = this.lastGenerationResult.answerKeyCsv
      .trim()
      .split("\n")[0];
    assert.equal(firstLine, expectedHeader);
  }
);

Then(
  "cada versão gerada deve ter {int} questões",
  function (this: AvaliaProWorld, count: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    for (const exam of this.lastGenerationResult.exams) {
      assert.equal(
        exam.questions.length,
        count,
        `Exam #${exam.examNumber} has ${exam.questions.length} questions, expected ${count}`
      );
    }
  }
);

Then(
  "a chave de respostas da versão {int} não deve ser numérica",
  function (this: AvaliaProWorld, examNumber: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    const lines = this.lastGenerationResult.answerKeyCsv
      .trim()
      .split("\n")
      .filter(Boolean);
    const dataLine = lines.find((l) => l.startsWith(`${examNumber},`));
    assert.ok(dataLine, `No data line found for exam ${examNumber}`);
    const answers = dataLine.split(",").slice(1);
    for (const answer of answers) {
      assert.ok(
        !/^\d+$/.test(answer.trim()),
        `Expected non-numeric answer but got "${answer}"`
      );
    }
  }
);

Then(
  "a chave de respostas da versão {int} deve ser numérica",
  function (this: AvaliaProWorld, examNumber: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    const lines = this.lastGenerationResult.answerKeyCsv
      .trim()
      .split("\n")
      .filter(Boolean);
    const dataLine = lines.find((l) => l.startsWith(`${examNumber},`));
    assert.ok(dataLine, `No data line found for exam ${examNumber}`);
    const answers = dataLine.split(",").slice(1);
    for (const answer of answers) {
      assert.ok(
        /^\d+$/.test(answer.trim()),
        `Expected numeric answer but got "${answer}"`
      );
    }
  }
);
