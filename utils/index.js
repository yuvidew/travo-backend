// utils/helpers.js
const MAX_LIMIT = 200;

const SE_ASIA = [
    "myanmar", "thailand", "vietnam", "laos", "cambodia",
    "malaysia", "singapore", "indonesia", "philippines",
    "brunei", "timor-leste"
];

const shortMessage = (msg = "") => {
    // was > 5 by mistake; use 50 for readability
    return msg.length > 50 ? msg.slice(0, 47) + "..." : msg;
};

const sanitizeAndFixSql = (input) => {
    if (!input) throw new Error("Empty SQL from generator");
    let sql = String(input).trim()
        .replace(/^```[a-z]*\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    if (sql.includes(";")) sql = sql.split(";")[0].trim();
    const lower = sql.toLowerCase();

    if (!lower.startsWith("select")) {
        throw new Error("Generated SQL must be a SELECT statement.");
    }

    const banned = [
        " insert ", " update ", " delete ", " create ", " alter ", " drop ", " truncate ",
        " grant ", " revoke ", " replace ", " call ", " exec ", " show ", " use ",
        " into outfile", " into dumpfile"
    ];
    if (banned.some(k => lower.includes(k))) {
        throw new Error("Generated SQL contains forbidden keywords.");
    }

    const warnings = [];

    // Expand "southeast asia"
    if (/southeast\s*asia/i.test(lower)) {
        const countryLikeRe = /lower\s*\(\s*country\s*\)\s*like\s*'%southeast\s*asia%'/i;
        if (countryLikeRe.test(sql)) {
            sql = sql.replace(
                countryLikeRe,
                `LOWER(country) IN (${SE_ASIA.map(c => `'${c}'`).join(", ")})`
            );
            warnings.push('Expanded "Southeast Asia" to specific country list.');
        }

        const jsonCountryLikeRe = /lower\s*\(\s*json_unquote\s*\(\s*json_extract\s*\(\s*result\s*,\s*'\$\.country'\s*\)\s*\)\s*\)\s*like\s*'%southeast\s*asia%'/i;
        if (jsonCountryLikeRe.test(sql)) {
            sql = sql.replace(
                jsonCountryLikeRe,
                `LOWER(JSON_UNQUOTE(JSON_EXTRACT(result, '$.country'))) IN (${SE_ASIA.map(c => `'${c}'`).join(", ")})`
            );
            if (!warnings.includes('Expanded "Southeast Asia" to specific country list.')) {
                warnings.push('Expanded "Southeast Asia" to specific country list.');
            }
        }

        if (!countryLikeRe.test(sql) && !jsonCountryLikeRe.test(sql)) {
            const regionFilter = `(
        LOWER(country) IN (${SE_ASIA.map(c => `'${c}'`).join(", ")})
        OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(result, '$.country'))) IN (${SE_ASIA.map(c => `'${c}'`).join(", ")})
      )`;
            if (/where/i.test(sql)) sql = sql.replace(/where/i, `WHERE ${regionFilter} AND `);
            else sql = sql.replace(/from\s+trips/i, m => `${m} WHERE ${regionFilter} `);
            if (!warnings.includes('Expanded "Southeast Asia" to specific country list.')) {
                warnings.push('Expanded "Southeast Asia" to specific country list.');
            }
        }
    }

    // Ensure/cap LIMIT
    if (!/limit\s+\d+/i.test(sql)) {
        sql = `${sql} LIMIT 20`;
    } else {
        sql = sql.replace(/limit\s+(\d+)/i, (m, n) => {
            const num = Math.min(parseInt(n, 10) || 20, MAX_LIMIT);
            return `LIMIT ${num}`;
        });
    }

    return { sql, warnings };
};

module.exports = { shortMessage, sanitizeAndFixSql };
