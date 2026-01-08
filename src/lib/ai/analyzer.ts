import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
    apiKey: process.env.PROXY_API_KEY,
});

export type AIAnalysisResult = {
    summary: string;
    doc_type: "blueprint" | "contract" | "invoice" | "permit" | "other";
    extracted_date: string | null;
    monetary_value: number | null;
    tags: string[];
};

export async function analyzeDocument(text: string): Promise<AIAnalysisResult> {
    if (!text) {
        throw new Error("No text provided for analysis");
    }

    // Truncate text if too long to avoid token limits (standard safeguard)
    const truncatedText = text.slice(0, 15000);

    const systemPrompt = `
    You are an expert Quantity Surveyor and Architect. 
    Analyze the text from this construction document. 
    Return a strict JSON object with: 
    { 
      "summary": "Brief 1-sentence summary", 
      "doc_type": "blueprint" | "contract" | "invoice" | "permit" | "other", 
      "extracted_date": "YYYY-MM-DD" or null, 
      "monetary_value": number or null (extract total amount if invoice/contract), 
      "tags": ["array", "of", "relevant", "keywords"] 
    }.
  `;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this document content:\n\n${truncatedText}` },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No analysis returned from AI");

        const result = JSON.parse(content) as AIAnalysisResult;
        return result;
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Return a fallback or rethrow depending on business logic. 
        // Here we rethrow to let the UI know analysis failed.
        throw error;
    }
}
