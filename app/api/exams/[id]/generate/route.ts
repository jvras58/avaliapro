import { NextResponse } from "next/server";
import { getExam } from "@/domain/exams";
import { generateExams } from "@/domain/generation";
import { bundleExamsPdf } from "@/domain/zip";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";

  try {
    const body: { count: number } = await request.json();
    const count = Number(body.count);
    if (!Number.isInteger(count) || count < 1) {
      return NextResponse.json(
        { error: "count must be a positive integer." },
        { status: 400 }
      );
    }

    const exam = await getExam(id);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const result = generateExams(exam, count);

    if (format === "pdf") {
      const zipBuffer = await bundleExamsPdf(result.exams);
      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="exams_${id}.zip"`,
        },
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[POST /api/exams/:id/generate]", error);
    return NextResponse.json(
      { error: "Failed to generate exams." },
      { status: 500 }
    );
  }
}
