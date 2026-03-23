import { listQuestions } from "@/domain/questions";
import { ExamForm } from "@/components/exams/ExamForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Exam",
};

export default async function NewExamPage() {
  const questions = await listQuestions();

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">New Exam</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details and select the questions to include.
        </p>
      </div>
      <ExamForm allQuestions={questions} />
    </div>
  );
}
