import "server-only";

export function analyticsTimeBoundaries() {
  const now = Date.now();
  return {
    since7Timestamp: now - 7 * 86_400_000,
    since30Iso: new Date(now - 30 * 86_400_000).toISOString(),
  };
}
