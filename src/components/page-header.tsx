import { Container } from "@/components/ui/container";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border-soft bg-gradient-to-b from-secondary/55 to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/12 blur-3xl"
      />
      <Container className="relative py-14 sm:py-18">
        {subtitle && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
            {subtitle}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
      </Container>
    </div>
  );
}
