import Link from "next/link";
import { listExams } from "@/domain/exams";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExamDeleteButton } from "@/components/exams/ExamDeleteButton";

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

      {exams.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No exams yet.{" "}
          <Link href="/exams/new" className="underline">
            Create the first one.
          </Link>
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Questions</TableHead>
              <TableHead className="w-32">Mode</TableHead>
              <TableHead className="w-48 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>
                  <p className="font-medium">{exam.title}</p>
                  {exam.course && (
                    <p className="text-xs text-muted-foreground">{exam.course}</p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm text-center">
                  {exam.questions.length}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {exam.identificationMode === "letters"
                      ? "Letters"
                      : "Powers of 2"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/exams/${exam.id}/generate`}>Generate</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/exams/${exam.id}/edit`}>Edit</Link>
                  </Button>
                  <ExamDeleteButton examId={exam.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
