# خادم Tavily MCP

[English](README.md)

خادم MCP (عبر stdio، مكتوب بـ TypeScript) يمنح المساعد بحثاً حياً في الويب عبر [Tavily](https://tavily.com): البحث والاستخراج والخريطة والزحف.

## الأدوات
- `tavily_search`: بحث في الويب مع إجابة اختيارية وأخبار/مال وفلاتر التاريخ والنطاق
- `tavily_extract`: محتوى نظيف من حتى 20 رابطاً مع تصفية حسب الاستعلام
- `tavily_map`: اكتشاف بنية روابط موقع (بلا محتوى)
- `tavily_crawl`: الزحف على موقع وإرجاع محتوى صفحاته

يوجد أيضاً بديل أبسط بأداة واحدة بلغة بايثون (`server.py`، الأداة `web_search`).

## التثبيت
```bash
npm install && npm run build
cp .env.example .env     # ثم ضع مفتاحك الحقيقي في .env (ولا ترفعه أبداً)
```
احصل على مفتاح من https://app.tavily.com.

### عميل الطرفية
```bash
<client-cli> mcp add tavily -e TAVILY_API_KEY=tvly-xxxx -- node /absolute/path/to/tavily-mcp-server/dist/index.js
```

### عميل سطح المكتب
عدّل `<client config file>` (انظر [mcp_client_config.example.json](mcp_client_config.example.json))، ثم أغلق التطبيق بـ `Cmd+Q` وافتحه.

> نسخة TypeScript **لا تقرأ `.env`**؛ مرّر المفتاح عبر إعداد `env` في العميل كما سبق.

### التجربة
```bash
TAVILY_API_KEY=tvly-xxxx npx @modelcontextprotocol/inspector node dist/index.js
```

### نسخة بايثون البديلة
```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/mcp dev server.py
```

## الأمان
لا ترفع أبداً `.env` ولا `mcp_client_config.json` الحقيقي ولا ملفات `*.bak`.
