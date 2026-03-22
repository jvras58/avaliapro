"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  examId: string;
}

export function ExamDeleteButton({ examId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this exam? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete exam.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? "Deleting…" : "Delete"}
    </Button>
  );
}
