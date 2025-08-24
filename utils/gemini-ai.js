
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Build a concise schema + tiny sample from raw rows.
 */
function buildSchemaAndSample(rows = []) {
    const first = rows[0] || {};
    const keys = Object.keys(first);

    // Infer basic types
    const typeOf = (v) => {
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "number") return Number.isInteger(v) ? "INT" : "DECIMAL";
        if (typeof v === "string") {
            // detect ISO date-ish
            if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return "DATETIME";
            // detect JSON in `result`
            try {
                const parsed = JSON.parse(v);
                if (parsed && typeof parsed === "object") return "JSON(TXT)";
            } catch (_) { }
            return "VARCHAR/TEXT";
        }
        if (typeof v === "boolean") return "TINYINT(1)";
        return "TEXT";
    };

    const columns = keys.map(k => {
        const sample = first[k];
        return `${k} (${typeOf(sample)})`;
    });

    // Try to parse JSON structure in `result`
    let resultFields = [];
    try {
        if (first.result) {
            const r = typeof first.result === "string" ? JSON.parse(first.result) : first.result;
            if (r && typeof r === "object") {
                resultFields = Object.keys(r).slice(0, 12); // keep short
            }
        }
    } catch { }

    // Make a tiny sample (minified) of up to 3 rows with a few useful columns
    const pick = (r) => {
        const base = {
            id: r.id,
            country: r.country,
            group_type: r.group_type,
            travel_style: r.travel_style,
            interest: r.interest,
            budget_estimate: r.budget_estimate,
            created_at: r.created_at,
            is_published: r.is_published
        };
        // include a trimmed result preview
        try {
            const rr = typeof r.result === "string" ? JSON.parse(r.result) : r.result;
            if (rr && typeof rr === "object") {
                base.result = {
                    name: rr.name,
                    duration: rr.duration,
                    estimatedPrice: rr.estimatedPrice,
                    travelStyle: rr.travelStyle,
                    country: rr.country,
                    interests: rr.interests,
                    groupType: rr.groupType,
                    location: rr.location?.city
                };
            }
        } catch { }
        return base;
    };

    const sample = rows.slice(0, 3).map(pick);

    return {
        schemaText: columns.join(", "),
        resultJsonKeys: resultFields,
        sampleText: JSON.stringify(sample)
    };
}

async function getGeminiResult(userMessage, rowsArray) {
    const { schemaText, resultJsonKeys, sampleText } = buildSchemaAndSample(rowsArray);

    // prefer 1.5 Pro; fall back to Flash if needed
    const tryModels = ["gemini-1.5-pro", "gemini-1.5-flash"];
    const apiOpts = { apiVersion: "v1beta" }; // use "v1" if your key supports stable

    const prompt = `
You are a SQL query generator. Based on the user's natural language request, generate a SQL query for a MySQL "trips" table.

Table Schema (inferred):
${schemaText}

JSON field "result" includes (examples): ${resultJsonKeys.length ? resultJsonKeys.join(", ") : "(unknown keys)"}

Tiny Sample Rows (minified, for shape only — do not hardcode these values):
${sampleText}

User Request: "${userMessage}"

STRICT RULES:
1) Return ONLY the SQL text (no backticks, no comments, no explanation).
2) MySQL 8+ syntax.
3) SELECT-only. Never use INSERT/UPDATE/DELETE/ALTER/DROP/TRUNCATE/SHOW/USE/REPLACE/CALL/EXEC/INTO OUTFILE.
4) Always include a LIMIT clause (default 20) unless user specifies otherwise; cap LIMIT at 200.
5) Prefer direct columns when possible: id, user_id, country, group_type, travel_style, interest, budget_estimate, created_at, is_published.
6) Text searches: use LOWER(column) LIKE '%term%'. For JSON fields in "result", use:
   LOWER(JSON_UNQUOTE(JSON_EXTRACT(result, '$.path'))) LIKE '%term%'.
7) Price filters (e.g., "under $500") parse numeric from $.estimatedPrice:
   CAST(REGEXP_REPLACE(JSON_UNQUOTE(JSON_EXTRACT(result, '$.estimatedPrice')), '[^0-9.]', '') AS DECIMAL(10,2))
8) Duration filters (days): CAST(JSON_EXTRACT(result, '$.duration') AS UNSIGNED).
9) Destinations/cities: search both "country" and $.location.city.
10) Style/group: match top-level columns and JSON mirrors (travel_style/$.travelStyle, group_type/$.groupType, interest/$.interests).
11) Default filter: is_published = 1 unless the user asks for drafts/unpublished.
12) Date filters use created_at.
13) ORDER BY relevance when obvious (e.g., price ASC for "cheap", created_at DESC for recency); otherwise ORDER BY created_at DESC.
14) Return a single statement only.

Examples (illustrative — adapt to the user request):
-- "trips under $500"
SELECT *
FROM trips
WHERE is_published = 1
  AND CAST(REGEXP_REPLACE(JSON_UNQUOTE(JSON_EXTRACT(result, '$.estimatedPrice')), '[^0-9.]', '') AS DECIMAL(10,2)) <= 500
ORDER BY CAST(REGEXP_REPLACE(JSON_UNQUOTE(JSON_EXTRACT(result, '$.estimatedPrice')), '[^0-9.]', '') AS DECIMAL(10,2)) ASC
LIMIT 20;

-- "trips to Yangon"
SELECT *
FROM trips
WHERE is_published = 1
  AND (
    LOWER(country) LIKE '%yangon%' OR
    LOWER(JSON_UNQUOTE(JSON_EXTRACT(result, '$.location.city'))) LIKE '%yangon%'
  )
ORDER BY created_at DESC
LIMIT 20;

Return only the SQL:
`.trim();

    let lastErr;
    for (const modelId of tryModels) {
        try {
            const model = genAI.getGenerativeModel({ model: modelId }, apiOpts);
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (err) {
            lastErr = err;
        }
    }
    throw lastErr;
}

module.exports = { getGeminiResult };
