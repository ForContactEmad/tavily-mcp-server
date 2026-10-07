"""Tavily web search MCP server (stdio) for Claude Desktop / Cursor."""
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from tavily import TavilyClient

# Load .env that sits next to this file, regardless of the client's working dir.
load_dotenv(Path(__file__).resolve().parent / ".env")

mcp = FastMCP("tavily-web-search")


def _error(message: str) -> str:
    return json.dumps({"error": message}, ensure_ascii=False, indent=2)


@mcp.tool()
async def web_search(
    query: str,
    search_depth: Literal["basic", "advanced"] = "basic",
    max_results: int = 5,
) -> str:
    """بحث حي في الويب واستخراج المحتوى النظيف للنتائج (Live web search returning clean content).

    Args:
        query: نص البحث (search text).
        search_depth: "basic" للبحث السريع أو "advanced" للبحث العميق.
        max_results: عدد النتائج (1-20، الافتراضي 5).

    Returns:
        JSON string: {"query": ..., "results": [{"title", "url", "content"}, ...]}
        or {"error": "..."} on failure.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return _error(
            "TAVILY_API_KEY is not set. Add it to the .env file next to server.py "
            "or to the 'env' section of your MCP client config."
        )
    if not query.strip():
        return _error("'query' must not be empty.")
    if not 1 <= max_results <= 20:
        return _error("'max_results' must be between 1 and 20.")
    if search_depth not in ("basic", "advanced"):
        return _error("'search_depth' must be 'basic' or 'advanced'.")

    try:
        client = TavilyClient(api_key=api_key)
        # The Tavily client is synchronous; run it off the event loop.
        response = await asyncio.to_thread(
            client.search,
            query=query,
            search_depth=search_depth,
            max_results=max_results,
        )
    except Exception as exc:  # invalid key, network failure, rate limit, ...
        return _error(f"Tavily request failed ({type(exc).__name__}): {exc}")

    results = [
        {
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "content": r.get("content", ""),
        }
        for r in response.get("results", [])
    ]
    return json.dumps(
        {"query": query, "results": results}, ensure_ascii=False, indent=2
    )


if __name__ == "__main__":
    print("tavily-web-search MCP server running on stdio", file=sys.stderr)
    mcp.run(transport="stdio")
