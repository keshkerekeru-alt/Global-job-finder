import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    service: "Global Job Finder MCP",
    status: "ok",
    protocol: "MCP Streamable HTTP",
    endpoint: "/api/mcp",
    liveSearchConfigured: Boolean(
      (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) ||
      process.env.JOOBLE_API_KEY
    )
  });
}
