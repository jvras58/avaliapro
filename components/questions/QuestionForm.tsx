"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Question, AlternativeInput } from "@/domain/types";

interface Props {
  /** When provided, the form operates in edit mode. */
  initialData?: Question;
}

interface AlternativeRow extends AlternativeInput {
  /** Stable key for React list rendering */
  key: string;
}

function emptyAlternative(): AlternativeRow {
  return { key: crypto.randomUUID(), description: "", shouldBeMarked: false };
}

export function QuestionForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [statement, setStatement] = useState(initialData?.statement ?? "");
  const [alternatives, setAlternatives] = useState<AlternativeRow[]>(
    initialData && initialData.alternatives.length > 0
      ? initialData.alternatives.map((a) => ({
          key: a.id,
          description: a.description,
          shouldBeMarked: a.shouldBeMarked,
        }))
      : [emptyAlternative(), emptyAlternative()]
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addAlternative() {
    setAlternatives((prev) => [...prev, emptyAlternative()]);
  }

  function removeAlternative(key: string) {
    setAlternatives((prev) => prev.filter((a) => a.key !== key));
  }

  function updateAlternative(key: string, patch: Partial<AlternativeInput>) {
    setAlternatives((prev) =>
      prev.map((a) => (a.key === key ? { ...a, ...patch } : a))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      statement,
      alternatives: alternatives.map(({ description, shouldBeMarked }) => ({
        description,
        shouldBeMarked,
      })),
    };

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/questions/${initialData!.id}`
        : "/api/questions";
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

      router.push("/questions");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Question" : "New Question"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statement">Statement</Label>
            <Textarea
              id="statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Enter the question statement…"
              rows={3}
              required
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Alternatives</p>
            {alternatives.map((alt, index) => (
              <div key={alt.key} className="flex items-start gap-3">
                <span className="mt-2 text-sm text-muted-foreground w-5 shrink-0">
                  {index + 1}.
                </span>
                <Input
                  value={alt.description}
                  onChange={(e) =>
                    updateAlternative(alt.key, { description: e.target.value })
                  }
                  placeholder={`Alternative ${index + 1}`}
                  required
                  className="flex-1"
                />
                <div className="flex items-center gap-1.5 mt-2 shrink-0">
                  <Checkbox
                    id={`correct-${alt.key}`}
                    checked={alt.shouldBeMarked}
                    onCheckedChange={(checked) =>
                      updateAlternative(alt.key, {
                        shouldBeMarked: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor={`correct-${alt.key}`}
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
                  onClick={() => removeAlternative(alt.key)}
                  disabled={alternatives.length <= 2}
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
              onClick={addAlternative}
            >
              + Add alternative
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create question"}
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
