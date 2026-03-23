import { NextResponse } from "next/server";
import { listQuestions, createQuestion } from "@/domain/questions";
import type { CreateQuestionInput } from "@/domain/types";

export async function GET() {
  try {
    const questions = await listQuestions();
    return NextResponse.json(questions, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[GET /api/questions]", error);
    return NextResponse.json(
      { error: "Failed to fetch questions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateQuestionInput = await request.json();
    const question = await createQuestion(body);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[POST /api/questions]", error);
    return NextResponse.json(
      { error: "Failed to create question." },
      { status: 500 }
    );
  }
}
