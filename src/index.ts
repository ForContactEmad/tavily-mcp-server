#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { tavilyPost, truncate } from "./client.js";

const server = new McpServer({ name: "tavily-mcp-server", version: "1.0.0" });

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const responseFormat = z
  .enum(["markdown", "json"])
  .default("markdown")
  .describe("Output format: 'markdown' (readable, default) or 'json' (raw API response)");

function ok(data: unknown, markdown: string, format: "markdown" | "json") {
  const text = format === "json" ? JSON.stringify(data, null, 2) : markdown;
  return {
    content: [{ type: "text" as const, text: truncate(text) }],
    structuredContent: data as Record<string, unknown>,
  };
}

function fail(err: unknown) {
  return {
    isError: true,
    content: [
      { type: "text" as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` },
    ],
  };
}

// ---------- tavily_search ----------
server.registerTool(
  "tavily_search",
  {
    title: "Tavily Web Search",
    description: `Search the web via Tavily and return ranked results with content snippets, optionally with an LLM-generated answer.

Use for current events, fact-finding, research, and discovering URLs. Use topic='news' for recent news (supports time filters) and topic='finance' for financial info. Follow up with tavily_extract to read full pages.

Returns: query, optional answer, results[] (title, url, content, score, optional published_date/raw_content), optional images.`,
    inputSchema: {
      query: z.string().min(1).describe("Search query, e.g. 'latest TypeScript 5.x features'"),
      search_depth: z
        .enum(["basic", "advanced", "fast", "ultra-fast"])
        .default("basic")
        .describe("'advanced' = highest relevance (2 credits); 'basic' = balanced; 'fast'/'ultra-fast' = lowest latency"),
      topic: z.enum(["general", "news", "finance"]).default("general").describe("Search category"),
      max_results: z.number().int().min(1).max(20).default(5).describe("Number of results (1-20)"),
      time_range: z
        .enum(["day", "week", "month", "year"])
        .optional()
        .describe("Only results published/updated within this window"),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Earliest date, YYYY-MM-DD"),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Latest date, YYYY-MM-DD"),
      include_answer: z
        .union([z.boolean(), z.enum(["basic", "advanced"])])
        .default(false)
        .describe("Include an LLM-generated answer ('advanced' is more detailed)"),
      include_raw_content: z
        .union([z.boolean(), z.enum(["markdown", "text"])])
        .default(false)
        .describe("Include full page content per result (large; use sparingly)"),
      include_images: z.boolean().default(false).describe("Include related images"),
      include_domains: z.array(z.string()).max(300).optional().describe("Restrict to these domains, e.g. ['github.com']"),
      exclude_domains: z.array(z.string()).max(150).optional().describe("Exclude these domains"),
      country: z.string().optional().describe("Boost results from a country, e.g. 'united states' (general topic only)"),
      response_format: responseFormat,
    },
    outputSchema: {
      query: z.string(),
      answer: z.string().nullish(),
      results: z.array(z.object({}).passthrough()),
      images: z.array(z.any()).optional(),
    },
    annotations: { title: "Tavily Web Search", ...readOnly },
  },
  async ({ response_format, ...params }) => {
    try {
      const data = await tavilyPost("/search", params);
      const lines: string[] = [`# Search: ${data.query}`];
      if (data.answer) lines.push("", "## Answer", data.answer);
      lines.push("", `## Results (${data.results?.length ?? 0})`);
      for (const [i, r] of (data.results ?? []).entries()) {
        lines.push("", `### ${i + 1}. ${r.title}`, r.url);
        if (r.published_date) lines.push(`Published: ${r.published_date}`);
        lines.push(`Score: ${Number(r.score).toFixed(2)}`, "", r.content);
        if (r.raw_content) lines.push("", "<raw_content>", r.raw_content, "</raw_content>");
      }
      if (data.images?.length) {
        lines.push("", "## Images");
        for (const img of data.images) {
          lines.push(typeof img === "string" ? `- ${img}` : `- ${img.url}${img.description ? ` — ${img.description}` : ""}`);
        }
      }
      return ok(data, lines.join("\n"), response_format);
    } catch (e) {
      return fail(e);
    }
  }
);

// ---------- tavily_extract ----------
server.registerTool(
  "tavily_extract",
  {
    title: "Tavily Extract Content",
    description: `Extract clean content from one or more known URLs (up to 20).

Use when you already have URLs (e.g., from tavily_search). Provide 'query' to return only the most relevant chunks instead of the whole page, which saves context.

Returns: results[] (url, raw_content) and failed_results[] (url, error).`,
    inputSchema: {
      urls: z.array(z.string().url()).min(1).max(20).describe("URLs to extract (1-20)"),
      query: z.string().optional().describe("Rerank content chunks by relevance to this query"),
      chunks_per_source: z.number().int().min(1).max(5).default(3).describe("Chunks per URL when 'query' is set (1-5)"),
      extract_depth: z.enum(["basic", "advanced"]).default("basic").describe("'advanced' handles tables, embedded content, JS-heavy pages (slower, more credits)"),
      format: z.enum(["markdown", "text"]).default("markdown").describe("Content format"),
      include_images: z.boolean().default(false).describe("Include image URLs"),
      timeout: z.number().min(1).max(60).optional().describe("Per-request timeout in seconds (1-60)"),
      response_format: responseFormat,
    },
    outputSchema: {
      results: z.array(z.object({}).passthrough()),
      failed_results: z.array(z.object({}).passthrough()).optional(),
    },
    annotations: { title: "Tavily Extract Content", ...readOnly },
  },
  async ({ response_format, ...params }) => {
    try {
      const data = await tavilyPost("/extract", params);
      const lines: string[] = [`# Extracted ${data.results?.length ?? 0} page(s)`];
      for (const r of data.results ?? []) {
        lines.push("", `## ${r.url}`, "", r.raw_content);
      }
      if (data.failed_results?.length) {
        lines.push("", "## Failed");
        for (const f of data.failed_results) lines.push(`- ${f.url}: ${f.error}`);
      }
      return ok(data, lines.join("\n"), response_format);
    } catch (e) {
      return fail(e);
    }
  }
);

// ---------- shared graph-traversal params ----------
const traversal = {
  url: z.string().url().describe("Root URL to begin from, e.g. 'https://docs.example.com'"),
  instructions: z.string().optional().describe("Natural-language guidance, e.g. 'Find all pages about the Python SDK' (increases credit cost)"),
  max_depth: z.number().int().min(1).max(5).default(1).describe("How many link-hops from the root (1-5)"),
  max_breadth: z.number().int().min(1).max(500).default(20).describe("Links followed per page (1-500)"),
  limit: z.number().int().min(1).default(20).describe("Total pages to process before stopping"),
  select_paths: z.array(z.string()).optional().describe("Regex path patterns to include, e.g. ['/docs/.*']"),
  select_domains: z.array(z.string()).optional().describe("Regex domain patterns to include"),
  exclude_paths: z.array(z.string()).optional().describe("Regex path patterns to exclude"),
  exclude_domains: z.array(z.string()).optional().describe("Regex domain patterns to exclude"),
  allow_external: z.boolean().default(true).describe("Follow links to external domains"),
  timeout: z.number().min(10).max(150).default(150).describe("Timeout in seconds (10-150)"),
};

// ---------- tavily_map ----------
server.registerTool(
  "tavily_map",
  {
    title: "Tavily Site Map",
    description: `Discover the URL structure of a website by traversing its links. Returns URLs only (no page content), so it's cheap and good for finding the right pages before extracting or crawling.

Returns: base_url and results[] (list of URLs).`,
    inputSchema: { ...traversal, response_format: responseFormat },
    outputSchema: { base_url: z.string(), results: z.array(z.string()) },
    annotations: { title: "Tavily Site Map", ...readOnly },
  },
  async ({ response_format, ...params }) => {
    try {
      const data = await tavilyPost("/map", params);
      const md = [`# Site map: ${data.base_url}`, `${data.results?.length ?? 0} URLs`, "", ...(data.results ?? []).map((u: string) => `- ${u}`)].join("\n");
      return ok(data, md, response_format);
    } catch (e) {
      return fail(e);
    }
  }
);

// ---------- tavily_crawl ----------
server.registerTool(
  "tavily_crawl",
  {
    title: "Tavily Site Crawl",
    description: `Crawl a website from a root URL and return extracted content for each discovered page. Can be expensive and large: keep 'limit' and 'max_depth' small, use select_paths, and prefer tavily_map first to scope the site.

Returns: base_url and results[] (url, raw_content).`,
    inputSchema: {
      ...traversal,
      chunks_per_source: z.number().int().min(1).max(5).default(3).describe("Chunks per page when 'instructions' is set (1-5)"),
      extract_depth: z.enum(["basic", "advanced"]).default("basic").describe("Extraction depth"),
      format: z.enum(["markdown", "text"]).default("markdown").describe("Content format"),
      include_images: z.boolean().default(false).describe("Include image URLs"),
      response_format: responseFormat,
    },
    outputSchema: {
      base_url: z.string(),
      results: z.array(z.object({}).passthrough()),
    },
    annotations: { title: "Tavily Site Crawl", ...readOnly },
  },
  async ({ response_format, ...params }) => {
    try {
      const data = await tavilyPost("/crawl", params);
      const lines = [`# Crawl: ${data.base_url}`, `${data.results?.length ?? 0} pages`];
      for (const r of data.results ?? []) lines.push("", `## ${r.url}`, "", r.raw_content);
      return ok(data, lines.join("\n"), response_format);
    } catch (e) {
      return fail(e);
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("tavily-mcp-server running on stdio");
