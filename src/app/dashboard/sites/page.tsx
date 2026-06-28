"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Site } from "@/lib/store/types";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/sites");
    const data = await res.json();
    if (data.ok) setSites(data.sites);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/sites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, url }),
    });
    setName("");
    setUrl("");
    load();
  }

  async function checkAll() {
    const res = await fetch("/api/sites/check", { method: "POST" });
    const data = await res.json();
    if (data.ok) setSites(data.sites);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">사이트 모니터</h1>
        <Button variant="outline" onClick={() => checkAll()}>전체 점검</Button>
      </div>

      <form className="flex flex-wrap gap-2" onSubmit={onSubmit}>
        <Input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required />
        <Button type="submit">추가</Button>
      </form>

      <div className="space-y-2">
        {sites.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between rounded-lg border p-3 text-sm">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{s.url}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.status === "up" ? "success" : s.status === "down" ? "destructive" : "outline"}>
                {s.status}
              </Badge>
              {s.httpCode && <span>{s.httpCode}</span>}
              {s.lastChecked && <span className="text-xs text-muted-foreground">{new Date(s.lastChecked).toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
