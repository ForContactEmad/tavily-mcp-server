# Tavily MCP Server

MCP server (stdio, TypeScript) exposing Tavily's `search`, `extract`, `map` and `crawl` APIs.

## Tools
- `tavily_search`: web search with optional answer, news/finance topics, date and domain filters
- `tavily_extract`: clean content from up to 20 URLs, with query-based chunk filtering
- `tavily_map`: discover a site's URL structure (no content)
- `tavily_crawl`: crawl a site and return page content

## Setup
```bash
npm install && npm run build
```
Add to Claude Code:
```bash
claude mcp add tavily -e TAVILY_API_KEY=tvly-xxxx -- node /absolute/path/to/tavily-mcp-server/dist/index.js
```
Test: `TAVILY_API_KEY=tvly-xxxx npx @modelcontextprotocol/inspector node dist/index.js`
