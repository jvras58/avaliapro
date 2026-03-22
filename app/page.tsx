import Link from "next/link";
import { listQuestions } from "@/domain/questions";
import { listExams } from "@/domain/exams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [questions, exams] = await Promise.all([listQuestions(), listExams()]);

  const stats = [
    {
      label: "Questions",
      value: questions.length,
      href: "/questions",
      action: "Manage questions",
    },
    {
      label: "Exams",
      value: exams.length,
      href: "/exams",
      action: "Manage exams",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">AvaliaPro</h1>
        <p className="text-muted-foreground mt-1">
          Exam creation and grading system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, href, action }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-bold">{value}</p>
              <Button asChild variant="outline" size="sm">
                <Link href={href}>{action}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Grading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload answer key and student responses to compute grades.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/grading">Go to grading</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
