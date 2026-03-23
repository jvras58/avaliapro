"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Exam, Question, IdentificationMode } from "@/domain/types";

interface Props {
  allQuestions: Question[];
  initialData?: Exam;
}

export function ExamForm({ allQuestions, initialData }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [course, setCourse] = useState(initialData?.course ?? "");
  const [instructor, setInstructor] = useState(initialData?.instructor ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [mode, setMode] = useState<IdentificationMode>(
    initialData?.identificationMode ?? "letters"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialData
      ? initialData.questions
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((eq) => eq.questionId)
      : []
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleQuestion(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedIds.length === 0) {
      setError("Select at least one question.");
      return;
    }

    const payload = {
      title,
      course,
      instructor,
      date,
      identificationMode: mode,
      questionIds: selectedIds,
    };

    startTransition(async () => {
      try {
        const url = isEdit ? `/api/exams/${initialData!.id}` : "/api/exams";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "An unexpected error occurred.");
          return;
        }

        router.push("/exams");
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Exam" : "New Exam"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metadata */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Exam title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Computer Science 101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Instructor name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 2025-06-15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Identification mode</Label>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as IdentificationMode)}
              >
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letters">Letters (A, B, C…)</SelectItem>
                  <SelectItem value="powers_of_2">
                    Powers of 2 (1, 2, 4…)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Question picker */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Questions{" "}
              <span className="text-muted-foreground font-normal">
                ({selectedIds.length} selected)
              </span>
            </p>
            {allQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions available. Create some first.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {allQuestions.map((q) => {
                  const selected = selectedIds.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => toggleQuestion(q.id)}
                      className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 flex-1">
                          {q.statement}
                        </span>
                        {selected && (
                          <Badge variant="secondary" className="shrink-0">
                            #{selectedIds.indexOf(q.id) + 1}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create exam"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/exams")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
