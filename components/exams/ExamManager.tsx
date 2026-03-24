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
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

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
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New exam
        </Button>
      </div>

      <Separator />

      {/* List */}
      <ExamList
        exams={initialExams}
        onCreateClick={() => setCreateOpen(true)}
        onEditClick={(exam) => setEditingExam(exam)}
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Exam</DialogTitle>
            <DialogDescription>
              Fill in the details and select the questions to include.
            </DialogDescription>
          </DialogHeader>
          <ExamForm
            allQuestions={allQuestions}
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editingExam !== null}
        onOpenChange={(open) => { if (!open) setEditingExam(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update the exam details or question selection.
            </DialogDescription>
          </DialogHeader>
          {editingExam && (
            <ExamForm
              allQuestions={allQuestions}
              initialData={editingExam}
              onSuccess={() => setEditingExam(null)}
              onCancel={() => setEditingExam(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
