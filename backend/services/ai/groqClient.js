import 'dotenv/config';
import { parseJsonObject } from './jsonParser.js';

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const isAiEnabled = () => process.env.AI_FEATURES_ENABLED !== 'false';

export const isGroqConfigured = () => Boolean(process.env.GROQ_API_KEY);

const getTimeoutMs = () => {
    const timeout = Number(process.env.AI_REQUEST_TIMEOUT_MS);
    return Number.isFinite(timeout) && timeout > 0 ? timeout : 15000;
};

export const createJsonCompletion = async ({
    prompt,
    model = process.env.GROQ_MODEL_FAST || 'llama-3.1-8b-instant',
    temperature = 0.1
}) => {
    if (!isAiEnabled()) {
        throw new Error('AI features are disabled');
    }

    if (!isGroqConfigured()) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs());

    try {
        const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                temperature,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'Return only valid JSON. Do not include markdown or explanations.'
                    },
                    { role: 'user', content: prompt }
                ]
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Groq request failed with ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content;
        const parsed = parseJsonObject(content);

        if (!parsed) {
            throw new Error('Groq returned invalid JSON');
        }

        return {
            data: parsed,
            rawResponse: payload,
            provider: 'groq',
            model
        };
    } finally {
        clearTimeout(timeoutId);
    }
};
