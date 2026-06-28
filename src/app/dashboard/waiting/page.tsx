"use client";

import { useCallback, useEffect, useState } from "react";
import { WaitingList } from "@/components/waiting/waiting-list";
import type { WaitingItem } from "@/lib/store/types";

export default function WaitingPage() {
  const [items, setItems] = useState<WaitingItem[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/waiting");
    const data = await res.json();
    if (data.ok) setItems(data.items);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <WaitingList items={items} onRefresh={load} />;
}
