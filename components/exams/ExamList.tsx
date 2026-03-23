"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { Exam } from "@/domain/types";
import { queryKeys, fetchExams, deleteExam } from "@/lib/api";

interface Props {
  exams: Exam[];
}

export function ExamList({ exams }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: queryKeys.exams,
    queryFn: fetchExams,
    initialData: exams,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams });
      router.refresh();
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
      <p className="text-muted-foreground text-sm">
        No exams yet.{" "}
        <Link href="/exams/new" className="underline">
          Create the first one.
        </Link>
      </p>
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
          <TableRow key={exam.id}>
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
