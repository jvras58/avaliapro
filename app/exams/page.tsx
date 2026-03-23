import { listExams } from "@/domain/exams";
import { listQuestions } from "@/domain/questions";
import { ExamManager } from "@/components/exams/ExamManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exams",
};

export default async function ExamsPage() {
  const [exams, questions] = await Promise.all([listExams(), listQuestions()]);

  return <ExamManager initialExams={exams} allQuestions={questions} />;
}
