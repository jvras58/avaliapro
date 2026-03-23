import { notFound } from "next/navigation";
import { getQuestion } from "@/domain/questions";
import { QuestionForm } from "@/components/questions/QuestionForm";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Edit Question",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: Props) {
  const { id } = await params;
  const question = await getQuestion(id);

  if (!question) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Question</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update the statement or alternatives below.
        </p>
      </div>
      <QuestionForm initialData={question} />
    </div>
  );
}
