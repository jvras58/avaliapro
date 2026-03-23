"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { GradingReport } from "@/domain/types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const gradingSchema = z.object({
  answerKeyFile: z
    .instanceof(File, { message: "Answer key CSV is required" })
    .refine((f) => f.size > 0, "Answer key CSV is required"),
  studentsFile: z
    .instanceof(File, { message: "Students' answers CSV is required" })
    .refine((f) => f.size > 0, "Students' answers CSV is required"),
  mode: z.enum(["strict", "lenient"]),
});

type GradingFormValues = z.infer<typeof gradingSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GradingPanel() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<GradingReport | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      mode: "strict",
    },
  });

  const mode = watch("mode");

  function onSubmit(values: GradingFormValues) {
    setReport(null);
    startTransition(async () => {
      try {
        const [answerKeyCsv, studentAnswersCsv] = await Promise.all([
          readFileAsText(values.answerKeyFile),
          readFileAsText(values.studentsFile),
        ]);

        const res = await fetch("/api/grading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answerKeyCsv,
            studentAnswersCsv,
            mode: values.mode,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError("root", {
            message: data.error ?? "Grading failed.",
          });
          return;
        }

        const data: GradingReport = await res.json();
        setReport(data);
      } catch {
        setError("root", { message: "Network error. Please try again." });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSVs</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answerKey">Answer key CSV</Label>
              <input
                id="answerKey"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) =>
                  setValue("answerKeyFile", e.target.files?.[0] as File, {
                    shouldValidate: true,
                  })
                }
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              />
              {errors.answerKeyFile && (
                <p className="text-xs text-destructive">
                  {errors.answerKeyFile.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: <code>exam_number,q1,q2,…</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentsFile">Students&apos; answers CSV</Label>
              <input
                id="studentsFile"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) =>
                  setValue("studentsFile", e.target.files?.[0] as File, {
                    shouldValidate: true,
                  })
                }
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              />
              {errors.studentsFile && (
                <p className="text-xs text-destructive">
                  {errors.studentsFile.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: <code>student_id,exam_number,q1,q2,…</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradingMode">Grading mode</Label>
              <Select
                value={mode}
                onValueChange={(v) =>
                  setValue("mode", v as GradingFormValues["mode"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="gradingMode" className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">
                    Strict — any error = 0 for the question
                  </SelectItem>
                  <SelectItem value="lenient">
                    Lenient — proportional score
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Grading…" : "Grade exams"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {errors.root && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Average", value: report.average.toFixed(2) },
                { label: "Min", value: report.min.toFixed(2) },
                { label: "Max", value: report.max.toFixed(2) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Per-student table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead className="w-24 text-center">Exam #</TableHead>
                  <TableHead className="w-24 text-center">Score</TableHead>
                  <TableHead className="w-24 text-center">Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.grades.map((g) => (
                  <TableRow key={g.studentId}>
                    <TableCell>{g.studentId}</TableCell>
                    <TableCell className="text-center">{g.examNumber}</TableCell>
                    <TableCell className="text-center font-medium">
                      {g.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {g.maxTotal}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
