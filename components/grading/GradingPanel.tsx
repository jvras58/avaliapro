"use client";

import { useState } from "react";
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
import type { GradingMode, GradingReport } from "@/domain/types";

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function GradingPanel() {
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);
  const [mode, setMode] = useState<GradingMode>("strict");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GradingReport | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answerKeyFile || !studentsFile) {
      setError("Please upload both CSV files.");
      return;
    }
    setError(null);
    setReport(null);
    setLoading(true);
    try {
      const [answerKeyCsv, studentAnswersCsv] = await Promise.all([
        readFileAsText(answerKeyFile),
        readFileAsText(studentsFile),
      ]);

      const res = await fetch("/api/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerKeyCsv, studentAnswersCsv, mode }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Grading failed.");
        return;
      }

      const data: GradingReport = await res.json();
      setReport(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSVs</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answerKey">Answer key CSV</Label>
              <input
                id="answerKey"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setAnswerKeyFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              />
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
                onChange={(e) => setStudentsFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Format: <code>student_id,exam_number,q1,q2,…</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradingMode">Grading mode</Label>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as GradingMode)}
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

            <Button type="submit" disabled={loading}>
              {loading ? "Grading…" : "Grade exams"}
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
                {report.grades.map((g, i) => (
                  <TableRow key={i}>
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
