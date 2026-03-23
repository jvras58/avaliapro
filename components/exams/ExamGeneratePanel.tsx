"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateExamJson, generateExamPdf } from "@/lib/api";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const generateSchema = z.object({
  count: z
    .number({ message: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1 exam required")
    .max(200, "Maximum 200 exams"),
});

type GenerateFormValues = z.infer<typeof generateSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  examId: string;
  questionCount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExamGeneratePanel({ examId, questionCount }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: { count: 1 },
  });

  const count = watch("count");

  const generateMutation = useMutation({
    mutationFn: (values: GenerateFormValues) =>
      generateExamJson(examId, values.count),
  });

  const pdfMutation = useMutation({
    mutationFn: () => generateExamPdf(examId, count),
    onSuccess: (blob) => {
      triggerDownload(blob, "exams.zip");
    },
  });

  function onSubmit(values: GenerateFormValues) {
    generateMutation.mutate(values);
  }

  function downloadCsv() {
    if (!generateMutation.data) return;
    const blob = new Blob([generateMutation.data.answerKeyCsv], {
      type: "text/csv",
    });
    triggerDownload(blob, "answer_key.csv");
  }

  const result = generateMutation.data ?? null;
  const error =
    (generateMutation.error as Error | null)?.message ??
    (pdfMutation.error as Error | null)?.message ??
    null;

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Generation settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of exams</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={200}
                {...register("count", { valueAsNumber: true })}
              />
              {errors.count && (
                <p className="text-xs text-destructive">
                  {errors.count.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Each exam will have {questionCount} question
                {questionCount !== 1 ? "s" : ""} in a randomised order.
              </p>
            </div>
            <Button type="submit" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "Generating…" : "Generate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Generated{" "}
              <strong>{result.exams.length}</strong> exam
              {result.exams.length !== 1 ? "s" : ""} successfully.
            </p>

            <div className="rounded-md border p-3 bg-muted">
              <p className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wide">
                Answer key preview
              </p>
              <pre className="text-xs overflow-x-auto whitespace-pre">
                {result.answerKeyCsv}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={downloadCsv}>
                Download answer_key.csv
              </Button>
              <Button
                variant="outline"
                onClick={() => pdfMutation.mutate()}
                disabled={pdfMutation.isPending}
              >
                {pdfMutation.isPending
                  ? "Generating PDFs…"
                  : "Download PDFs (ZIP)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
