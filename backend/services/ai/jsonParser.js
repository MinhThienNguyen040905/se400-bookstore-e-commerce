const stripCodeFence = (text) => {
    if (!text) return '';
    return text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
};

export const parseJsonObject = (text) => {
    if (!text || typeof text !== 'string') {
        return null;
    }

    const cleaned = stripCodeFence(text);

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            return null;
        }

        try {
            return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
        } catch (innerErr) {
            return null;
        }
    }
};

export const clampNumber = (value, min, max, fallback = 0) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
};
