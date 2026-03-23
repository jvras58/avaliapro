import Link from "next/link";
import { listExams } from "@/domain/exams";
import { Button } from "@/components/ui/button";
import { ExamList } from "@/components/exams/ExamList";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exams",
};

export default async function ExamsPage() {
  const exams = await listExams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Exams</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {exams.length} exam{exams.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button asChild>
          <Link href="/exams/new">New exam</Link>
        </Button>
      </div>

      <ExamList exams={exams} />
    </div>
  );
}
