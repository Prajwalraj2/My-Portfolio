import type { Metadata } from "next";
import { InquiryForm } from "@/components/dashboard/inquiry-form";
import { getSession } from "@/lib/auth.server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const user = await getSession();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Work with Prajwal</h1>
      <p className="mt-1 text-muted-foreground">
        Tell me about your project or role — freelance, full-time, or a collaboration.
      </p>
      <div className="mt-8">
        <InquiryForm defaultName={user?.name ?? undefined} defaultEmail={user?.email} />
      </div>
    </div>
  );
}
