"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import type { Question } from "@/domain/types";
import { queryKeys, fetchQuestions, deleteQuestion } from "@/lib/api";

interface Props {
  questions: Question[];
  /** Called when the empty-state CTA is clicked (e.g. to open the inline form) */
  onCreateClick?: () => void;
}

export function QuestionList({ questions, onCreateClick }: Props) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.questions,
    queryFn: fetchQuestions,
    initialData: questions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    },
    onError: () => {
      alert("Failed to delete question.");
    },
  });

  function handleDelete(id: string) {
    if (!confirm("Delete this question? This action cannot be undone.")) return;
    deleteMutation.mutate(id);
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-7 w-7" />}
        title="No questions yet"
        description="Create your first question to start building exams."
        action={
          onCreateClick
            ? { label: "New question", onClick: onCreateClick }
            : undefined
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Statement</TableHead>
          <TableHead className="w-28 text-center">Alternatives</TableHead>
          <TableHead className="w-36 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((q) => (
          <TableRow key={q.id} className="transition-colors hover:bg-muted/40">
            <TableCell className="max-w-xl">
              <p className="line-clamp-2">{q.statement}</p>
            </TableCell>
            <TableCell className="text-center text-muted-foreground text-sm">
              {q.alternatives.length}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/questions/${q.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === q.id
                }
                onClick={() => handleDelete(q.id)}
              >
                {deleteMutation.isPending && deleteMutation.variables === q.id
                  ? "Deleting…"
                  : "Delete"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
