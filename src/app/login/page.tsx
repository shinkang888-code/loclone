import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-6">로딩…</main>}>
      <LoginClient />
    </Suspense>
  );
}
