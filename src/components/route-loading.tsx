import { Loader2 } from "lucide-react";

export function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  );
}
