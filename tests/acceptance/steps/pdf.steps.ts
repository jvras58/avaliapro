import assert from "node:assert/strict";
import JSZip from "jszip";
import { When, Then } from "@cucumber/cucumber";
import type { AvaliaProWorld } from "../../support/world";
import { renderExamPdf } from "@/domain/pdf";
import { bundleExamsPdf } from "@/domain/zip";

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  "eu renderizo o PDF da versão {int}",
  async function (this: AvaliaProWorld, examNumber: number) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    const exam = this.lastGenerationResult.exams.find(
      (e) => e.examNumber === examNumber
    );
    assert.ok(exam, `No generated exam found for version ${examNumber}`);
    this.lastError = null;
    try {
      this.lastPdfBuffer = await renderExamPdf(exam);
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

When(
  "eu empacoto os PDFs das provas geradas",
  async function (this: AvaliaProWorld) {
    assert.ok(this.lastGenerationResult, "Expected a generation result");
    this.lastError = null;
    try {
      this.lastZipBuffer = await bundleExamsPdf(this.lastGenerationResult.exams);
    } catch (e) {
      this.lastError = e as Error;
    }
  }
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  "o buffer do PDF não deve estar vazio",
  function (this: AvaliaProWorld) {
    assert.ok(this.lastPdfBuffer, "Expected a PDF buffer");
    assert.ok(
      this.lastPdfBuffer.length > 0,
      "Expected PDF buffer to be non-empty"
    );
  }
);

Then(
  "o buffer do PDF deve começar com a assinatura {string}",
  function (this: AvaliaProWorld, signature: string) {
    assert.ok(this.lastPdfBuffer, "Expected a PDF buffer");
    const header = this.lastPdfBuffer.subarray(0, signature.length).toString("ascii");
    assert.equal(
      header,
      signature,
      `Expected PDF to start with "${signature}" but got "${header}"`
    );
  }
);

Then(
  "o buffer do ZIP não deve estar vazio",
  function (this: AvaliaProWorld) {
    assert.ok(this.lastZipBuffer, "Expected a ZIP buffer");
    assert.ok(
      this.lastZipBuffer.length > 0,
      "Expected ZIP buffer to be non-empty"
    );
  }
);

Then(
  "o ZIP deve conter {int} arquivos PDF",
  async function (this: AvaliaProWorld, expectedCount: number) {
    assert.ok(this.lastZipBuffer, "Expected a ZIP buffer");
    const zip = await JSZip.loadAsync(this.lastZipBuffer);
    const pdfFiles = Object.keys(zip.files).filter((name) =>
      name.endsWith(".pdf")
    );
    assert.equal(
      pdfFiles.length,
      expectedCount,
      `Expected ${expectedCount} PDF files in ZIP but found ${pdfFiles.length}`
    );
  }
);

Then(
  "o ZIP deve conter um arquivo chamado {string}",
  async function (this: AvaliaProWorld, fileName: string) {
    assert.ok(this.lastZipBuffer, "Expected a ZIP buffer");
    const zip = await JSZip.loadAsync(this.lastZipBuffer);
    assert.ok(
      zip.files[fileName],
      `Expected ZIP to contain "${fileName}" but it was not found`
    );
  }
);
