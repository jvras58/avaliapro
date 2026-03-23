import { listQuestions } from "@/domain/questions";
import { QuestionManager } from "@/components/questions/QuestionManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions",
};

export default async function QuestionsPage() {
  const questions = await listQuestions();

  return <QuestionManager initialQuestions={questions} />;
}
