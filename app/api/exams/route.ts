import { NextResponse } from "next/server";
import { listExams, createExam } from "@/domain/exams";
import type { CreateExamInput } from "@/domain/types";

export async function GET() {
  try {
    const exams = await listExams();
    return NextResponse.json(exams, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[GET /api/exams]", error);
    return NextResponse.json(
      { error: "Failed to fetch exams." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateExamInput = await request.json();
    const exam = await createExam(body);
    return NextResponse.json(exam, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error("[POST /api/exams]", error);
    return NextResponse.json(
      { error: "Failed to create exam." },
      { status: 500 }
    );
  }
}
