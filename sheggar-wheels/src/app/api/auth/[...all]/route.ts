import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// better-sqlite3 needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
