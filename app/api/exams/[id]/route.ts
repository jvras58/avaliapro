import { NextResponse } from "next/server";
import { getExam, updateExam, deleteExam } from "@/domain/exams";
import type { UpdateExamInput } from "@/domain/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const exam = await getExam(id);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }
    return NextResponse.json(exam);
  } catch (error) {
    console.error("[GET /api/exams/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch exam." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body: UpdateExamInput = await request.json();
    const exam = await updateExam(id, body);
    return NextResponse.json(exam);
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === "Exam not found." ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("[PUT /api/exams/:id]", error);
    return NextResponse.json(
      { error: "Failed to update exam." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteExam(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Exam not found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("[DELETE /api/exams/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete exam." },
      { status: 500 }
    );
  }
}
