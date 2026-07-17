"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { GithubIcon, GoogleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { login, signup } from "@/lib/auth-actions";

const fieldClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      if (isLogin) await login(data.email, data.password);
      else await signup(data.email, data.password, data.name || undefined);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-xl border p-6 shadow-sm">
        <h1 className="font-heading text-xl font-semibold">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin
            ? "Log in to book calls, chat, and manage your API keys."
            : "Sign up to book calls, chat, and manage your API keys."}
        </p>

        {/* Social */}
        <div className="mt-6 grid gap-2">
          <a
            href="/api/proxy/auth/google"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            <GoogleIcon className="size-4" /> Continue with Google
          </a>
          <a
            href="/api/proxy/auth/github"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            <GithubIcon className="size-4" /> Continue with GitHub
          </a>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin ? (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input id="name" name="name" className={fieldClass} />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className={fieldClass}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              No account?{" "}
              <Link href="/signup" className="text-foreground underline underline-offset-4">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Have an account?{" "}
              <Link href="/login" className="text-foreground underline underline-offset-4">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
