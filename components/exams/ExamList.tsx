"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import type { Exam } from "@/domain/types";
import { queryKeys, fetchExams, deleteExam } from "@/lib/api";

interface Props {
  exams: Exam[];
  /** Called when the empty-state CTA is clicked (e.g. to open the inline form) */
  onCreateClick?: () => void;
}

export function ExamList({ exams, onCreateClick }: Props) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.exams,
    queryFn: fetchExams,
    initialData: exams,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams });
    },
    onError: () => {
      alert("Failed to delete exam.");
    },
  });

  function handleDelete(id: string) {
    if (!confirm("Delete this exam? This action cannot be undone.")) return;
    deleteMutation.mutate(id);
  }

  if (data.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>No exams yet</EmptyTitle>
          <EmptyDescription>
            Create your first exam by selecting questions and configuring the details.
          </EmptyDescription>
        </EmptyHeader>
        {onCreateClick && (
          <EmptyContent>
            <Button onClick={onCreateClick}>
              New exam
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="w-24">Questions</TableHead>
          <TableHead className="w-32">Mode</TableHead>
          <TableHead className="w-48 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((exam) => (
          <TableRow key={exam.id} className="transition-colors hover:bg-muted/40">
            <TableCell>
              <p className="font-medium">{exam.title}</p>
              {exam.course && (
                <p className="text-xs text-muted-foreground">{exam.course}</p>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm text-center">
              {exam.questions.length}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {exam.identificationMode === "letters"
                  ? "Letters"
                  : "Powers of 2"}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/exams/${exam.id}/generate`}>Generate</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/exams/${exam.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === exam.id
                }
                onClick={() => handleDelete(exam.id)}
              >
                {deleteMutation.isPending && deleteMutation.variables === exam.id
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
