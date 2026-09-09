const attempts = new Map<string, { count: number; resetAt: number }>();

export function allowLoginAttempt(key: string, now = Date.now()) {
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 10;
}
