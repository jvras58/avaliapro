import { NextResponse } from "next/server";
import {
  parseAnswerKeyCsv,
  parseStudentAnswersCsv,
  gradeExams,
} from "@/domain/grading";
import type { GradingMode } from "@/domain/types";

export async function POST(request: Request) {
  try {
    const body: {
      answerKeyCsv: string;
      studentAnswersCsv: string;
      mode: GradingMode;
      pointsPerQuestion?: number;
    } = await request.json();

    if (!body.answerKeyCsv || !body.studentAnswersCsv) {
      return NextResponse.json(
        { error: "answerKeyCsv and studentAnswersCsv are required." },
        { status: 400 }
      );
    }
    if (body.mode !== "strict" && body.mode !== "lenient") {
      return NextResponse.json(
        { error: "mode must be 'strict' or 'lenient'." },
        { status: 400 }
      );
    }

    const answerKeyRows = parseAnswerKeyCsv(body.answerKeyCsv);
    const studentRows = parseStudentAnswersCsv(body.studentAnswersCsv);
    const report = gradeExams(
      answerKeyRows,
      studentRows,
      body.mode,
      body.pointsPerQuestion ?? 1
    );

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[POST /api/grading]", error);
    return NextResponse.json(
      { error: "Failed to grade exams." },
      { status: 500 }
    );
  }
}
