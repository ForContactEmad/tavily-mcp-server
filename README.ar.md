<div align="center" dir="rtl">

# خادم Tavily MCP

امنح مساعدك الذكي وصولاً حياً إلى الويب: بحث واستخراج وخريطة وزحف، عبر [Tavily](https://tavily.com).

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-stdio-black)

[English](README.md)

</div>

---

<div dir="rtl">

## نظرة عامة

خادم [MCP](https://modelcontextprotocol.io) (عبر stdio، مكتوب بـ TypeScript) يعرض واجهة Tavily كأدوات يمكن لأي عميل يدعم MCP استدعاؤها. ويوجد بديل أبسط بلغة بايثون بأداة واحدة.

## الأدوات

| الأداة | وظيفتها |
|--------|---------|
| `tavily_search` | بحث في الويب مع إجابة ذكية اختيارية وأخبار/مال وفلاتر التاريخ والنطاق |
| `tavily_extract` | محتوى نظيف من حتى 20 رابطاً مع تصفية حسب الاستعلام |
| `tavily_map` | اكتشاف بنية روابط موقع (بلا محتوى الصفحات) |
| `tavily_crawl` | الزحف على موقع وإرجاع محتوى صفحاته |

النسخة البديلة بلغة بايثون (`server.py`) توفّر أداة واحدة هي `web_search`.

## المتطلبات

- Node.js الإصدار 18 أو أحدث
- مفتاح Tavily API من [app.tavily.com](https://app.tavily.com)
- *(لنسخة بايثون فقط)* Python 3.12 وأداة [uv](https://github.com/astral-sh/uv)

## التثبيت

</div>

```bash
git clone https://github.com/ForContactEmad/tavily-mcp-server.git
cd tavily-mcp-server
npm install
npm run build
```

<div dir="rtl">

## الإعداد

نسخة TypeScript **لا تقرأ `.env`**. مرّر المفتاح عبر إعداد `env` في عميل MCP.

### عميل الطرفية

</div>

```bash
<client-cli> mcp add tavily \
  -e TAVILY_API_KEY=tvly-xxxx \
  -- node /absolute/path/to/tavily-mcp-server/dist/index.js
```

<div dir="rtl">

### عميل سطح المكتب

أضف الخادم إلى ملف إعداد العميل (انظر [`mcp_client_config.example.json`](mcp_client_config.example.json)):

</div>

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

<div dir="rtl">

ثم أغلق العميل تماماً (`Cmd+Q` على macOS) وافتحه من جديد.

## التجربة

جرّب الأدوات تفاعلياً عبر MCP Inspector:

</div>

```bash
TAVILY_API_KEY=tvly-xxxx npx @modelcontextprotocol/inspector node dist/index.js
```

<div dir="rtl">

## التطوير

</div>

```bash
npm run dev     # وضع المراقبة مع tsx
npm run build   # الترجمة إلى dist/
npm start       # تشغيل الخادم المُترجم
```

<div dir="rtl">

## نسخة بايثون البديلة

</div>

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
cp .env.example .env          # أضف مفتاحك الحقيقي
.venv/bin/mcp dev server.py
```

<div dir="rtl">

تقرأ هذه النسخة المفتاح من `.env`.

## بنية المشروع

</div>

```
.
├── src/
│   ├── index.ts      # الخادم وتعريف الأدوات
│   └── client.ts     # عميل Tavily API
├── server.py         # النسخة البديلة بلغة بايثون (web_search)
├── mcp_client_config.example.json
├── .env.example
└── package.json
```

<div dir="rtl">

## الأمان

- لا ترفع أبداً `.env` ولا `mcp_client_config.json` الحقيقي ولا ملفات `*.bak`؛ وهي مضافة أصلاً إلى `.gitignore`.
- استخدم قيماً وهمية مثل `tvly-xxxx` في الأمثلة ولقطات الشاشة.
- إذا انكشف مفتاحك يوماً، ألغِه من [app.tavily.com](https://app.tavily.com) وأنشئ مفتاحاً جديداً.

</div>
