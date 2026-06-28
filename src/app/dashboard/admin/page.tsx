"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/lib/store/types";

export default function AdminPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStats(d.stats);
          setUsers(d.users);
        } else {
          setError(d.error ?? "접근 거부");
        }
      });
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats) return <p>불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(stats).map(([k, v]) => (
          <Card key={k}>
            <p className="text-sm text-muted-foreground">{k}</p>
            <p className="text-2xl font-bold">{v}</p>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="mb-2 font-semibold">사용자</h2>
        <ul className="space-y-1 text-sm">
          {users.map((u) => (
            <li key={u.id}>{u.email} — {u.role}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
