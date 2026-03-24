"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { QuestionList } from "@/components/questions/QuestionList";
import { QuestionForm } from "@/components/questions/QuestionForm";
import type { Question } from "@/domain/types";

interface Props {
  initialQuestions: Question[];
}

export function QuestionManager({ initialQuestions }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your question bank. Questions can be reused across multiple exams.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New question
        </Button>
      </div>

      <Separator />

      {/* List */}
      <QuestionList
        questions={initialQuestions}
        onCreateClick={() => setCreateOpen(true)}
        onEditClick={(q) => setEditingQuestion(q)}
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Question</DialogTitle>
            <DialogDescription>
              Fill in the statement and add at least 2 alternatives.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editingQuestion !== null}
        onOpenChange={(open) => { if (!open) setEditingQuestion(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the statement or alternatives below.
            </DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <QuestionForm
              initialData={editingQuestion}
              onSuccess={() => setEditingQuestion(null)}
              onCancel={() => setEditingQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
