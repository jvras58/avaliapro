"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Question } from "@/domain/types";
import { queryKeys, createQuestion, updateQuestion } from "@/lib/api";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const alternativeSchema = z.object({
  description: z.string().min(1, "Alternative text is required"),
  shouldBeMarked: z.boolean(),
});

const questionSchema = z.object({
  statement: z.string().min(1, "Statement is required"),
  alternatives: z
    .array(alternativeSchema)
    .min(2, "At least two alternatives are required"),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  /** When provided, the form operates in edit mode. */
  initialData?: Question;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuestionForm({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(initialData);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      statement: initialData?.statement ?? "",
      alternatives:
        initialData && initialData.alternatives.length > 0
          ? initialData.alternatives.map((a) => ({
              description: a.description,
              shouldBeMarked: a.shouldBeMarked,
            }))
          : [
              { description: "", shouldBeMarked: false },
              { description: "", shouldBeMarked: false },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "alternatives",
  });

  const watchedAlternatives = watch("alternatives");

  const saveMutation = useMutation({
    mutationFn: (values: QuestionFormValues) =>
      isEdit
        ? updateQuestion(initialData!.id, values)
        : createQuestion(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
      if (initialData) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.question(initialData.id),
        });
      }
      router.push("/questions");
    },
    onError: (err: Error) => {
      setError("root", { message: err.message });
    },
  });

  function onSubmit(values: QuestionFormValues) {
    saveMutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Question" : "New Question"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statement">Statement</Label>
            <Textarea
              id="statement"
              {...register("statement")}
              placeholder="Enter the question statement…"
              rows={3}
            />
            {errors.statement && (
              <p className="text-sm text-destructive">
                {errors.statement.message}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Alternatives</p>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <span className="mt-2 text-sm text-muted-foreground w-5 shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1 space-y-1">
                  <Input
                    {...register(`alternatives.${index}.description`)}
                    placeholder={`Alternative ${index + 1}`}
                  />
                  {errors.alternatives?.[index]?.description && (
                    <p className="text-xs text-destructive">
                      {errors.alternatives[index]!.description!.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2 shrink-0">
                  <Checkbox
                    id={`correct-${field.id}`}
                    checked={watchedAlternatives[index]?.shouldBeMarked ?? false}
                    onCheckedChange={(checked) =>
                      setValue(
                        `alternatives.${index}.shouldBeMarked`,
                        checked === true,
                        { shouldValidate: true }
                      )
                    }
                  />
                  <Label
                    htmlFor={`correct-${field.id}`}
                    className="text-xs cursor-pointer"
                  >
                    Correct
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                  aria-label="Remove alternative"
                >
                  ✕
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", shouldBeMarked: false })}
            >
              + Add alternative
            </Button>
          </div>
        </CardContent>
      </Card>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create question"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/questions")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
