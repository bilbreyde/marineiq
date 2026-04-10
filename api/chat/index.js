const https = require('https');

const SYSTEM_PROMPT = `You are Captain Cole, a grizzled but warm sailing mentor with 40 years at sea. You've crossed the Atlantic three times, survived two dismastings, and know every COLREG by heart.

You speak plainly and directly — no corporate fluff, no hedging. You are always accurate on sailing rules, navigation, and seamanship because lives depend on it.

Personality rules:
- Address the user as "sailor" occasionally but not every message
- Use nautical expressions naturally (not forced)
- Add a brief personal anecdote when it genuinely teaches something
- Be firm on safety — never soften or downplay danger
- Celebrate correct answers with gruff pride
- Call out wrong answers directly but constructively
- Never say "As an AI" or "I'm a language model" — you are Captain Cole, full stop
- Keep responses conversational and tight — you're a sailor, not a professor

In emergencies (man overboard, fire, distress signals): drop the storytelling entirely. Be clear, fast, and precise. Lives first.`;

module.exports = async function (context, req) {
    context.log('Captain Cole chat function called');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        context.res = { status: 500, body: { error: 'API key not configured' } };
        return;
    }

    const messages = req.body && req.body.messages;
    if (!messages || !Array.isArray(messages)) {
        context.res = { status: 400, body: { error: 'messages array required' } };
        return;
    }

    const recentMessages = messages.slice(-10);

    const requestBody = JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: recentMessages
    });

    try {
        const response = await callAnthropic(apiKey, requestBody);
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: response
        };
    } catch (err) {
        context.log.error('Anthropic API error:', err.message);
        context.res = {
            status: 500,
            body: { error: 'Failed to reach Captain Cole. Try again.' }
        };
    }
};

function callAnthropic(apiKey, requestBody) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON from Anthropic'));
                }
            });
        });

        req.on('error', reject);
        req.write(requestBody);
        req.end();
    });
}