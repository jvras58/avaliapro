"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { Exam, Question } from "@/domain/types";
import { queryKeys, createExamApi, updateExamApi } from "@/lib/api";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  course: z.string(),
  instructor: z.string(),
  date: z.string(),
  identificationMode: z.enum(["letters", "powers_of_2"]),
  questionIds: z.array(z.string()).min(1, "Select at least one question"),
});

type ExamFormValues = z.infer<typeof examSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  allQuestions: Question[];
  initialData?: Exam;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExamForm({ allQuestions, initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      course: initialData?.course ?? "",
      instructor: initialData?.instructor ?? "",
      date: initialData?.date ?? "",
      identificationMode: initialData?.identificationMode ?? "letters",
      questionIds: initialData
        ? initialData.questions
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((eq) => eq.questionId)
        : [],
    },
  });

  const selectedIds = watch("questionIds");
  const mode = watch("identificationMode");

  const saveMutation = useMutation({
    mutationFn: (values: ExamFormValues) =>
      isEdit
        ? updateExamApi(initialData!.id, values)
        : createExamApi(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams });
      if (initialData) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.exam(initialData.id),
        });
      }
      router.refresh();
      router.push("/exams");
    },
    onError: (err: Error) => {
      setError("root", { message: err.message });
    },
  });

  function toggleQuestion(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((q) => q !== id)
      : [...selectedIds, id];
    setValue("questionIds", next, { shouldValidate: true });
  }

  function onSubmit(values: ExamFormValues) {
    saveMutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
              {...register("title")}
              placeholder="Exam title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                {...register("course")}
                placeholder="e.g. Computer Science 101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                {...register("instructor")}
                placeholder="Instructor name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                {...register("date")}
                placeholder="e.g. 2025-06-15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Identification mode</Label>
              <Select
                value={mode}
                onValueChange={(v) =>
                  setValue(
                    "identificationMode",
                    v as ExamFormValues["identificationMode"],
                    { shouldValidate: true }
                  )
                }
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
            {errors.questionIds && (
              <p className="text-sm text-destructive">
                {errors.questionIds.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create exam"}
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
