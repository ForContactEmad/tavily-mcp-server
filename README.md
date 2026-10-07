<div align="center">

# Tavily MCP Server

Give your AI assistant live web access: search, extract, map and crawl, powered by [Tavily](https://tavily.com).

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-stdio-black)

[العربية](README.ar.md)

</div>

---

## Overview

An [MCP](https://modelcontextprotocol.io) server (stdio transport, written in TypeScript) that exposes the Tavily API as tools any MCP-compatible client can call. A simpler single-tool Python version is included as an alternative.

## Tools

| Tool | What it does |
|------|--------------|
| `tavily_search` | Web search with an optional AI answer, news/finance topics, date and domain filters |
| `tavily_extract` | Clean content from up to 20 URLs, with query-based chunk filtering |
| `tavily_map` | Discover a site's URL structure (no page content) |
| `tavily_crawl` | Crawl a site and return page content |

The Python alternative (`server.py`) provides one tool, `web_search`.

## Requirements

- Node.js 18 or newer
- A Tavily API key from [app.tavily.com](https://app.tavily.com)
- *(Python version only)* Python 3.12 and [uv](https://github.com/astral-sh/uv)

## Installation

```bash
git clone https://github.com/ForContactEmad/tavily-mcp-server.git
cd tavily-mcp-server
npm install
npm run build
```

## Configuration

The TypeScript server does **not** read `.env`. Pass your key through your MCP client's `env` setting.

### CLI client

```bash
<client-cli> mcp add tavily \
  -e TAVILY_API_KEY=tvly-xxxx \
  -- node /absolute/path/to/tavily-mcp-server/dist/index.js
```

### Desktop client

Add the server to your client's config file (see [`mcp_client_config.example.json`](mcp_client_config.example.json)):

```json
{
  "mcpServers": {
    "tavily": {
      "command": "node",
      "args": ["/absolute/path/to/tavily-mcp-server/dist/index.js"],
      "env": { "TAVILY_API_KEY": "tvly-xxxxxxxxxxxxxxxx" }
    }
  }
}
```

Then quit the client completely (`Cmd+Q` on macOS) and reopen it.

## Testing

Try the tools interactively with the MCP Inspector:

```bash
TAVILY_API_KEY=tvly-xxxx npx @modelcontextprotocol/inspector node dist/index.js
```

## Development

```bash
npm run dev     # watch mode with tsx
npm run build   # compile to dist/
npm start       # run the compiled server
```

## Python alternative

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
cp .env.example .env          # add your real key
.venv/bin/mcp dev server.py
```

This version reads the key from `.env`.

## Project structure

```
.
├── src/
│   ├── index.ts      # MCP server and tool definitions
│   └── client.ts     # Tavily API client
├── server.py         # Python alternative (web_search)
├── mcp_client_config.example.json
├── .env.example
└── package.json
```

## Security

- Never commit `.env`, a real `mcp_client_config.json`, or `*.bak` files; they are already in `.gitignore`.
- Use placeholders such as `tvly-xxxx` in examples and screenshots.
- If a key is ever exposed, revoke it at [app.tavily.com](https://app.tavily.com) and create a new one.
