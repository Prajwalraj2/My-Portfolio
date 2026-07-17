import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-heading text-6xl font-semibold tracking-tight">404</p>
      <h1 className="mt-4 text-lg font-medium">This page wandered off.</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The link may be broken, or the page may have moved. Let&apos;s get you back.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6")}>
        Back home
      </Link>
    </Container>
  );
}
