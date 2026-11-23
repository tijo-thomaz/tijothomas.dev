// Route entry for /api/chat (removed in U-04, ADR-P2). The handlers are legacy terminal code in
// src/terminal/api, kept unchanged there so the legacy-terminal override is exactly src/terminal/**.
export { GET, POST } from '@/terminal/api/chat/route';
