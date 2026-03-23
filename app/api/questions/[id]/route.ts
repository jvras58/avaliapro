import { NextResponse } from "next/server";
import {
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/domain/questions";
import type { UpdateQuestionInput } from "@/domain/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const question = await getQuestion(id);
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }
    return NextResponse.json(question, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/questions/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch question." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body: UpdateQuestionInput = await request.json();
    const question = await updateQuestion(id, body);
    return NextResponse.json(question, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === "Question not found." ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status, headers: { "Cache-Control": "no-store" } });
    }
    console.error("[PUT /api/questions/:id]", error);
    return NextResponse.json(
      { error: "Failed to update question." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteQuestion(id);
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Question not found.") {
      return NextResponse.json({ error: error.message }, {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error("[DELETE /api/questions/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete question." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
