import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <AuthForm mode="login" />
    </Container>
  );
}
