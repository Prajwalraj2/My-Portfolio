"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-provider";

export function TalkToLisaButton() {
  const { openChat } = useChat();
  return (
    <button
      type="button"
      onClick={openChat}
      className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
    >
      Talk to Lisa
    </button>
  );
}
