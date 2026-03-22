import Link from "next/link";
import { listQuestions } from "@/domain/questions";
import { QuestionList } from "@/components/questions/QuestionList";
import { Button } from "@/components/ui/button";

export default async function QuestionsPage() {
  const questions = await listQuestions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {questions.length} question{questions.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button asChild>
          <Link href="/questions/new">New question</Link>
        </Button>
      </div>

      <QuestionList questions={questions} />
    </div>
  );
}
