import JSZip from "jszip";
import type { GeneratedExam } from "@/domain/types";
import { renderExamPdf } from "@/domain/pdf";

/**
 * Renders each exam as a PDF and bundles them all into a single ZIP buffer.
 * The files inside the archive are named exam_1.pdf, exam_2.pdf, …
 */
export async function bundleExamsPdf(exams: GeneratedExam[]): Promise<Buffer> {
  const zip = new JSZip();

  await Promise.all(
    exams.map(async (exam) => {
      const pdf = await renderExamPdf(exam);
      zip.file(`exam_${exam.examNumber}.pdf`, pdf);
    })
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return buffer;
}
