"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/lib/store/types";

export default function AdminPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [worker, setWorker] = useState<{
    configured: boolean;
    health: { ok?: boolean; browserPool?: { active: number; max: number }; queueDepth?: number } | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/worker").then((r) => r.json()),
    ]).then(([statsData, workerData]) => {
      if (statsData.ok) {
        setStats(statsData.stats);
        setUsers(statsData.users);
      } else {
        setError(statsData.error ?? "접근 거부");
      }
      if (workerData.ok) setWorker(workerData);
    });
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats) return <p>불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(stats).map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-sm text-muted-foreground">{k}</p>
            <p className="text-2xl font-bold">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h2 className="mb-2 font-semibold">Clone Worker</h2>
        {worker?.configured ? (
          <ul className="text-sm space-y-1">
            <li>상태: {worker.health?.ok ? "정상" : "오프라인"}</li>
            <li>
              Browser pool: {worker.health?.browserPool?.active ?? 0} /{" "}
              {worker.health?.browserPool?.max ?? "?"}
            </li>
            <li>Queue depth: {worker.health?.queueDepth ?? 0}</li>
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            CLONE_WORKER_URL 미설정 — docker compose up clone-worker
          </p>
        )}
      </Card>

      <div>
        <h2 className="mb-2 font-semibold">사용자</h2>
        <ul className="space-y-1 text-sm">
          {users.map((u) => (
            <li key={u.id}>
              {u.email} — {u.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
