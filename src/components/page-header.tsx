import { Container } from "@/components/ui/container";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border bg-secondary/30">
      <Container className="py-12 sm:py-16">
        {subtitle && (
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {subtitle}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
      </Container>
    </div>
  );
}
