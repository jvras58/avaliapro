import { notFound } from "next/navigation";
import { getExam } from "@/domain/exams";
import { ExamGeneratePanel } from "@/components/exams/ExamGeneratePanel";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Generate Exam",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GenerateExamPage({ params }: Props) {
  const { id } = await params;
  const exam = await getExam(id);

  if (!exam) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Generate — {exam.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Choose how many individual exams to generate. Questions and
          alternatives will be shuffled for each one.
        </p>
      </div>
      <ExamGeneratePanel examId={exam.id} questionCount={exam.questions.length} />
    </div>
  );
}
