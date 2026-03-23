"use client";

import Link from "next/link";
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
import type { Question } from "@/domain/types";
import { queryKeys, fetchQuestions, deleteQuestion } from "@/lib/api";

interface Props {
  questions: Question[];
}

export function QuestionList({ questions }: Props) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.questions,
    queryFn: fetchQuestions,
    initialData: questions,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
      <p className="text-muted-foreground text-sm">
        No questions yet.{" "}
        <Link href="/questions/new" className="underline">
          Create the first one.
        </Link>
      </p>
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
          <TableRow key={q.id}>
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
