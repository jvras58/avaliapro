import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import {
  parseAnswerKeyCsv,
  parseStudentAnswersCsv,
  gradeExams,
} from "@/domain/grading";
import type { GradingMode } from "@/domain/types";

// ---------------------------------------------------------------------------
// State local to this step file (stored on world)
// ---------------------------------------------------------------------------

let _answerKeyCsv = "";
let _studentAnswersCsv = "";

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  "o gabarito CSV:",
  function (this: AvaliaProWorld, docString: string) {
    _answerKeyCsv = docString;
  }
);

Given(
  "as respostas dos alunos CSV:",
  function (this: AvaliaProWorld, docString: string) {
    _studentAnswersCsv = docString;
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
      const keyRows = parseAnswerKeyCsv(_answerKeyCsv);
      const studentRows = parseStudentAnswersCsv(_studentAnswersCsv);
      this.lastGradingReport = gradeExams(keyRows, studentRows, "strict" as GradingMode);
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
      const keyRows = parseAnswerKeyCsv(_answerKeyCsv);
      const studentRows = parseStudentAnswersCsv(_studentAnswersCsv);
      this.lastGradingReport = gradeExams(keyRows, studentRows, "lenient" as GradingMode);
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
