export const SESSION_COOKIE = "loclone_session";

export function isAuthDisabled(): boolean {
  return (
    process.env.LOCLONE_AUTH_MODE === "dev" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}
