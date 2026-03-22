import { GradingPanel } from "@/components/grading/GradingPanel";

export default function GradingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Grading</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload the answer key CSV and the students&apos; answers CSV to
          compute grades.
        </p>
      </div>
      <GradingPanel />
    </div>
  );
}
