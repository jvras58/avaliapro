import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import {
  parseAnswerKeyCsv,
  parseStudentAnswersCsv,
  gradeExams,
} from "@/domain/grading";

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  "o gabarito CSV:",
  function (this: AvaliaProWorld, docString: string) {
    this.lastAnswerKeyCsv = docString;
  }
);

Given(
  "as respostas dos alunos CSV:",
  function (this: AvaliaProWorld, docString: string) {
    this.lastStudentAnswersCsv = docString;
  }
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  "eu corrijo no modo estrito",
  function (this: AvaliaProWorld) {
    this.lastError = null;
    try {
      const keyRows = parseAnswerKeyCsv(this.lastAnswerKeyCsv);
      const studentRows = parseStudentAnswersCsv(this.lastStudentAnswersCsv);
      this.lastGradingReport = gradeExams(keyRows, studentRows, "strict");
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu corrijo no modo leniente",
  function (this: AvaliaProWorld) {
    this.lastError = null;
    try {
      const keyRows = parseAnswerKeyCsv(this.lastAnswerKeyCsv);
      const studentRows = parseStudentAnswersCsv(this.lastStudentAnswersCsv);
      this.lastGradingReport = gradeExams(keyRows, studentRows, "lenient");
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  "a nota do aluno {string} deve ser {float}",
  function (this: AvaliaProWorld, studentId: string, expectedScore: number) {
    assert.ok(this.lastGradingReport, "Expected a grading report");
    const grade = this.lastGradingReport.grades.find(
      (g) => g.studentId === studentId
    );
    assert.ok(grade, `No grade found for student "${studentId}"`);
    assert.equal(grade.total, expectedScore);
  }
);

Then(
  "a nota do aluno {string} deve ser maior que {float}",
  function (this: AvaliaProWorld, studentId: string, threshold: number) {
    assert.ok(this.lastGradingReport, "Expected a grading report");
    const grade = this.lastGradingReport.grades.find(
      (g) => g.studentId === studentId
    );
    assert.ok(grade, `No grade found for student "${studentId}"`);
    assert.ok(
      grade.total > threshold,
      `Expected grade > ${threshold} but got ${grade.total}`
    );
  }
);

Then(
  "a nota do aluno {string} deve ser menor que {float}",
  function (this: AvaliaProWorld, studentId: string, threshold: number) {
    assert.ok(this.lastGradingReport, "Expected a grading report");
    const grade = this.lastGradingReport.grades.find(
      (g) => g.studentId === studentId
    );
    assert.ok(grade, `No grade found for student "${studentId}"`);
    assert.ok(
      grade.total < threshold,
      `Expected grade < ${threshold} but got ${grade.total}`
    );
  }
);

Then(
  "o relatório deve conter média {float}",
  function (this: AvaliaProWorld, expectedAvg: number) {
    assert.ok(this.lastGradingReport, "Expected a grading report");
    assert.equal(this.lastGradingReport.average, expectedAvg);
  }
);

Then(
  "o relatório deve conter mínimo {float}",
  function (this: AvaliaProWorld, expectedMin: number) {
    assert.ok(this.lastGradingReport, "Expected a grading report");
    assert.equal(this.lastGradingReport.min, expectedMin);
  }
);

Then(
  "o relatório deve conter máximo {float}",
  function (this: AvaliaProWorld, expectedMax: number) {
    assert.ok(this.lastGradingReport, "Expected a grading report");
    assert.equal(this.lastGradingReport.max, expectedMax);
  }
);
