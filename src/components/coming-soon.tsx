import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function ComingSoon({ feature, note }: { feature: string; note?: string }) {
  return (
    <Card className="p-10 text-center border-dashed">
      <div className="mx-auto size-12 rounded-full bg-accent/30 grid place-items-center mb-4">
        <Sparkles className="size-5 text-accent-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold">{feature} is coming next</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        {note ?? "This module is wired into the database. The full UI ships in the next build phase."}
      </p>
    </Card>
  );
}
