import { QuestionForm } from "@/components/questions/QuestionForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Question",
};

export default function NewQuestionPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">New Question</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the statement and add at least 2 alternatives.
        </p>
      </div>
      <QuestionForm />
    </div>
  );
}
