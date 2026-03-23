"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  examId: string;
}

export function ExamDeleteButton({ examId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this exam? This action cannot be undone.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete exam.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? "Deleting…" : "Delete"}
    </Button>
  );
}
