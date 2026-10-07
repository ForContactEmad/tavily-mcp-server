# Tavily MCP Server

[العربية](README.ar.md)

An MCP server (stdio, TypeScript) that gives the assistant live web access through [Tavily](https://tavily.com): `search`, `extract`, `map` and `crawl`.

## Tools
- `tavily_search`: web search with optional answer, news/finance topics, date and domain filters
- `tavily_extract`: clean content from up to 20 URLs, with query-based chunk filtering
- `tavily_map`: discover a site's URL structure (no content)
- `tavily_crawl`: crawl a site and return page content

A simpler single-tool Python alternative (`server.py`, tool `web_search`) is also included.

## Setup
```bash
npm install && npm run build
cp .env.example .env     # then put your real key in .env (never commit it)
```
Get a key at https://app.tavily.com.

### CLI client
```bash
<client-cli> mcp add tavily -e TAVILY_API_KEY=tvly-xxxx -- node /absolute/path/to/tavily-mcp-server/dist/index.js
```

### Desktop client
Edit `<client config file>` (see [mcp_client_config.example.json](mcp_client_config.example.json)), then quit with `Cmd+Q` and reopen.

> The TypeScript server does **not** read `.env`; pass the key through the client's `env` setting as above.

### Test
```bash
TAVILY_API_KEY=tvly-xxxx npx @modelcontextprotocol/inspector node dist/index.js
```

### Python alternative
```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/mcp dev server.py
```

## Security
Never commit `.env`, a real `mcp_client_config.json`, or `*.bak` files.
