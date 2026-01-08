import OpenAI from "openai";

const apiKey = process.env.PROXY_API_KEY;

if (!apiKey || apiKey === "sk-...") {
    console.error("Error: PROXY_API_KEY is missing or invalid in environment.");
    process.exit(1);
}

const openai = new OpenAI({
    baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
    apiKey: apiKey,
});

async function main() {
    console.log("Testing connection to ProxyAPI...");
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "gpt-4o",
            messages: [{ role: "user", content: "Hello, just checking connection. Reply with 'OK'." }],
            max_tokens: 10,
        });
        console.log("Success! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Connection failed:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        process.exit(1);
    }
}

main();
