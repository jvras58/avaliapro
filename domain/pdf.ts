import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ExamDocument } from "@/components/pdf/ExamDocument";
import type { GeneratedExam } from "@/domain/types";

export async function renderExamPdf(exam: GeneratedExam): Promise<Buffer> {
  const element = createElement(ExamDocument, { exam }) as ReactElement<DocumentProps>;
  return renderToBuffer(element);
}
