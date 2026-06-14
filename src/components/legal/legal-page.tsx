import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  content: string | null;
  emptyMessage: string;
};

export function LegalPage({
  eyebrow,
  title,
  content,
  emptyMessage,
}: LegalPageProps) {
  return (
    <section className="bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase text-accent">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          {title}
        </h1>
        <Card className="mt-8 p-5 sm:p-8">
          {content ? (
            <div className="whitespace-pre-wrap text-sm leading-7 text-muted sm:text-base sm:leading-8">
              {content}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center text-center">
              <FileText className="size-8 text-accent" />
              <p className="mt-4 max-w-md text-sm leading-6 text-muted">
                {emptyMessage}
              </p>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
