import { notFound } from "next/navigation";
import { getExam } from "@/domain/exams";
import { listQuestions } from "@/domain/questions";
import { ExamForm } from "@/components/exams/ExamForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Exam",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditExamPage({ params }: Props) {
  const { id } = await params;
  const [exam, questions] = await Promise.all([getExam(id), listQuestions()]);

  if (!exam) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Exam</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update the exam details or question selection.
        </p>
      </div>
      <ExamForm allQuestions={questions} initialData={exam} />
    </div>
  );
}
