"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setEmail(d.user?.email));
    fetch("/api/waiting", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen">
      <AppSidebar pathname={pathname} />
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader email={email} />
        <div className="flex-1 bg-background p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
