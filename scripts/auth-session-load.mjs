const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const count = Number(process.argv[2] || 25);
const concurrency = Number(process.argv[3] || 5);
const sessionCookie = process.env.SESSION_COOKIE || "";

const url = `${baseUrl}/api/auth/session`;

const headers = sessionCookie ? { cookie: sessionCookie } : {};

const runBatch = async (batchSize, offset) => {
  const tasks = Array.from({ length: batchSize }, (_, idx) => {
    const requestId = offset + idx + 1;
    const started = Date.now();
    return fetch(url, { headers })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => ({
        requestId,
        durationMs: Date.now() - started,
        ok: !!data?.user,
      }))
      .catch(() => ({
        requestId,
        durationMs: Date.now() - started,
        ok: false,
      }));
  });

  return Promise.all(tasks);
};

const run = async () => {
  const results = [];
  let processed = 0;
  while (processed < count) {
    const batchSize = Math.min(concurrency, count - processed);
    const batch = await runBatch(batchSize, processed);
    results.push(...batch);
    processed += batchSize;
  }

  const durations = results.map((r) => r.durationMs);
  const avg =
    durations.reduce((sum, value) => sum + value, 0) / durations.length;
  const max = Math.max(...durations);
  const min = Math.min(...durations);
  const okCount = results.filter((r) => r.ok).length;

  console.log(`Requests: ${count}`);
  console.log(`Authenticated responses: ${okCount}`);
  console.log(`Avg duration: ${avg.toFixed(1)}ms`);
  console.log(`Min duration: ${min}ms`);
  console.log(`Max duration: ${max}ms`);
};

run();
