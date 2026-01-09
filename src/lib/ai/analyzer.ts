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
    // New fields for vision/structural analysis
    rooms?: string[];
    materials?: string[];
};

export type BoQItem = {
    item_code: string;
    description: string;
    unit: string;
    quantity: number;
    category: string;
    specification?: string;
};

export type BoQResult = {
    items: BoQItem[];
    currency: string;
};

export async function analyzeDocument(content: string, isImage: boolean = false): Promise<AIAnalysisResult> {

    // If Text (PDF Parsed)
    if (!isImage) {
        if (!content) throw new Error("No text provided for analysis");
        const truncatedText = content.slice(0, 15000);

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

            const result = JSON.parse(completion.choices[0].message.content || "{}") as AIAnalysisResult;
            return result;

        } catch (error) {
            console.error("AI Text Analysis Failed:", error);
            throw error;
        }
    }

    // If Image (Vision Mode for Blueprints)
    // Content is expected to be a Base64 string or URL (but for this MVP assume we pass a description OR we pass Base64 if needed. 
    // Ideally we pass the Image_URL if stored in Supabase, but providing Public URL to OpenAI might need bucket policy.
    // For now, let's assume 'content' passed here IS the public URL or base64.

    const visionPrompt = `
    You are an expert Architect. Analyze this image of a construction document (blueprint/drawing).
    Identify visible rooms, structural elements, and materials.
    Return a strict JSON object:
    {
      "summary": "Description of the architectural drawing",
      "doc_type": "blueprint",
      "extracted_date": null,
      "monetary_value": null,
      "tags": ["blueprint", "architectural", "drawing"],
      "rooms": ["Living Room", "Kitchen", etc],
      "materials": ["Concrete", "Glass", etc]
    }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Vision model
            messages: [
                { role: "system", content: visionPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this blueprint." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": content, // Ensure this is a valid accessible URL or Data URI
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content || "{}") as AIAnalysisResult;
        return result;

    } catch (error) {
        console.error("AI Vision Analysis Failed:", error);
        throw error;
    }
}

export async function generateBoQ(content: string, isImage: boolean = false): Promise<BoQResult> {
    const systemPrompt = `
    You are a professional Quantity Surveyor.
    Extract a Bill of Quantities (BoQ) from the provided construction document (blueprint or specifications).
    
    If the input is sparse/visual, estimate quantities based on standard architectural ratios for the identified rooms/elements.
    
    Return a JSON object:
    {
      "items": [
        {
          "item_code": "01.01",
          "description": " Detailed description of item",
          "unit": "sqm/m3/pcs/lm",
          "quantity": number,
          "category": "Concrete/Masonry/Finishes/MEP/etc",
          "specification": "Reference to standard or specific specs"
        }
      ],
      "currency": "AED"
    }
    `;

    try {
        let messages: any[] = [{ role: "system", content: systemPrompt }];

        if (isImage) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: "Create a Bill of Quantities from this blueprint." },
                    { type: "image_url", image_url: { url: content } }
                ]
            });
        } else {
            messages.push({ role: "user", content: `Create a BoQ from this text:\n\n${content.slice(0, 20000)}` });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}") as BoQResult;
        return result;

    } catch (error) {
        console.error("BoQ Generation Failed:", error);
        return { items: [], currency: "AED" };
    }
}

export async function matchBidItems(
    bidItems: BoQItem[],
    masterItems: { id: string; description: string; quantity: number }[]
): Promise<{ bidItemIndex: number; masterItemId: string | null; confidence: number }[]> {
    const systemPrompt = `
    Match the Contractor's Bid Items to the Master BoQ Items.
    
    Master Items:
    ${JSON.stringify(masterItems.map(m => ({ id: m.id, desc: m.description, qty: m.quantity })))}
    
    Bid Items:
    ${JSON.stringify(bidItems.map((b, i) => ({ index: i, desc: b.description, qty: b.quantity })))}
    
    Return a JSON object with a key "mappings" containing an array:
    {
      "mappings": [
        { "bidItemIndex": 0, "masterItemId": "uuid-here", "confidence": 0.95 },
        { "bidItemIndex": 1, "masterItemId": null, "confidence": 0.1 } 
      ]
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: systemPrompt }],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{ \"mappings\": [] }");
        return result.mappings || [];
    } catch (error) {
        console.error("Smart Matching Failed:", error);
        return [];
    }
}

