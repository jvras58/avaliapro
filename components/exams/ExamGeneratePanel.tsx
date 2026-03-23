"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { GenerationResult } from "@/domain/types";

interface Props {
  examId: string;
  questionCount: number;
}

export function ExamGeneratePanel({ examId, questionCount }: Props) {
  const [count, setCount] = useState(1);
  const [isGenerating, startGenerate] = useTransition();
  const [isPdfPending, startPdf] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    startGenerate(async () => {
      try {
        const res = await fetch(`/api/exams/${examId}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Generation failed.");
          return;
        }
        const data: GenerationResult = await res.json();
        setResult(data);
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  function downloadCsv() {
    if (!result) return;
    const blob = new Blob([result.answerKeyCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "answer_key.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdfs() {
    if (!result) return;
    setError(null);
    startPdf(async () => {
      try {
        const res = await fetch(`/api/exams/${examId}/generate?format=pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "PDF generation failed.");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "exams.zip";
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        setError("Network error while generating PDFs. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Generation settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of exams</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Each exam will have {questionCount} question
                {questionCount !== 1 ? "s" : ""} in a randomised order.
              </p>
            </div>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating…" : "Generate"}
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
              <Button variant="outline" onClick={downloadPdfs} disabled={isPdfPending}>
                {isPdfPending ? "Generating PDFs…" : "Download PDFs (ZIP)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
