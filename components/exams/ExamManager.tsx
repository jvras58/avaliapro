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
import { ExamList } from "@/components/exams/ExamList";
import { ExamForm } from "@/components/exams/ExamForm";
import type { Exam, Question } from "@/domain/types";

interface Props {
  initialExams: Exam[];
  allQuestions: Question[];
}

export function ExamManager({ initialExams, allQuestions }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build and manage exams. Each exam randomises question and alternative order on generation.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New exam
        </Button>
      </div>

      <Separator />

      {/* List */}
      <ExamList
        exams={initialExams}
        onCreateClick={() => setOpen(true)}
      />

      {/* Creation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Exam</DialogTitle>
            <DialogDescription>
              Fill in the details and select the questions to include.
            </DialogDescription>
          </DialogHeader>
          <ExamForm
            allQuestions={allQuestions}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
