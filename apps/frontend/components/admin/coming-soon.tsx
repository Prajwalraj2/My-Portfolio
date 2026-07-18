import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
        <Construction className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">This section is coming next.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The backend endpoints are ready — the management UI lands in the next build.
        </p>
      </div>
    </div>
  );
}
