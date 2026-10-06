const BASE_URL = "https://api.tavily.com";
export const CHARACTER_LIMIT = 25000;

export async function tavilyPost(
  endpoint: string,
  body: Record<string, unknown>
): Promise<any> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY environment variable is not set. Get a key at https://app.tavily.com and add it to the MCP server's env config."
    );
  }
  // Drop undefined values so Tavily applies its own defaults.
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  );
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(explainHttpError(res.status, text));
  }
  return res.json();
}

function explainHttpError(status: number, text: string): string {
  const detail = text.slice(0, 500);
  switch (status) {
    case 400:
      return `Tavily rejected the request (400): ${detail}. Check parameter values.`;
    case 401:
      return "Tavily authentication failed (401). Verify TAVILY_API_KEY is valid (starts with 'tvly-').";
    case 429:
      return "Tavily rate limit exceeded (429). Wait a moment and retry with fewer requests.";
    case 432:
    case 433:
      return `Tavily plan or credit limit exceeded (${status}): ${detail}. Check usage at https://app.tavily.com.`;
    default:
      return `Tavily API error (${status}): ${detail}`;
  }
}

export function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  return (
    text.slice(0, CHARACTER_LIMIT) +
    `\n\n[Truncated: response exceeded ${CHARACTER_LIMIT} characters. Reduce max_results, use 'query'/'instructions' to focus, or lower limits.]`
  );
}
