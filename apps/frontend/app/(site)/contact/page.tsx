import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Prajwal Raj.",
};

export default function ContactPage() {
  return (
    <Container className="py-16 md:py-24">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Get in touch</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Have a project, a role, or just want to say hi? Drop a message and it lands
        straight in Prajwal&apos;s inbox.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </Container>
  );
}
