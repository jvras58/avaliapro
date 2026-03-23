import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-muted/30 animate-in fade-in duration-300">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        {icon && (
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="space-y-1 max-w-xs">
          <p className="font-semibold text-base">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
