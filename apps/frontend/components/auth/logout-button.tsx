"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-actions";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await logout();
    } catch {
      /* ignore */
    }
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? "…" : "Log out"}
    </Button>
  );
}
