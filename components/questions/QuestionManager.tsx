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
  const [open, setOpen] = useState(false);

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
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New question
        </Button>
      </div>

      <Separator />

      {/* List */}
      <QuestionList
        questions={initialQuestions}
        onCreateClick={() => setOpen(true)}
      />

      {/* Creation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Question</DialogTitle>
            <DialogDescription>
              Fill in the statement and add at least 2 alternatives.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
