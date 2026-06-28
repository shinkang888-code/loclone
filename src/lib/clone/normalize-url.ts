export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("http/https URL만 지원합니다.");
  }
  return parsed.toString();
}
