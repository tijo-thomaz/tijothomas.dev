// Route entry for /api/analytics. The handlers are legacy terminal code (src/terminal/api), kept
// unchanged there so the Oxlint legacy-terminal override stays exactly src/terminal/** (PLAT-AC-14).
export { GET, POST } from '@/terminal/api/analytics/route';
