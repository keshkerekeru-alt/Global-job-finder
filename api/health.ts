import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    service: "Global Job Finder MCP",
    status: "ok",
    protocol: "MCP Streamable HTTP",
    endpoint: "/api/mcp",
    liveSearchConfigured: false,
    liveSearchMode: "Use the connected agent platform web search; this MCP server provides official-source and verification tools only."
  });
}
