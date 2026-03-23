"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface Props {
  questions: Question[];
}

export function QuestionList({ questions }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this question? This action cannot be undone.")) return;

    setDeletingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
        if (!res.ok) {
          alert("Failed to delete question.");
          return;
        }
        router.refresh();
      } finally {
        setDeletingId(null);
      }
    });
  }

  if (questions.length === 0) {
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
        {questions.map((q) => (
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
                disabled={deletingId === q.id}
                onClick={() => handleDelete(q.id)}
              >
                {deletingId === q.id ? "Deleting…" : "Delete"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
