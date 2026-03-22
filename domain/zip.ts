import JSZip from "jszip";
import type { GeneratedExam } from "@/domain/types";
import { renderExamPdf } from "@/domain/pdf";

/**
 * Renders each exam as a PDF and bundles them all into a single ZIP buffer.
 * The files inside the archive are named exam_1.pdf, exam_2.pdf, …
 */
export async function bundleExamsPdf(exams: GeneratedExam[]): Promise<Buffer> {
  const pdfs = await Promise.all(exams.map((exam) => renderExamPdf(exam)));

  const zip = new JSZip();
  pdfs.forEach((pdf, i) => {
    zip.file(`exam_${exams[i].examNumber}.pdf`, pdf);
  });

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
