"use server";

import OpenAI from "openai";
import { retrieveContext } from "@/lib/ai/rag";

const openai = new OpenAI({
    baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
    apiKey: process.env.PROXY_API_KEY,
});

export type AuditResult = {
    compliance_score: number;
    issues: string[];
    recommendations: string[];
};

export async function analyzeEstimate(estimateText: string, projectId?: string): Promise<AuditResult> {
    if (!estimateText) throw new Error("No estimate text provided");

    // 1. Retrieve Context (Regulations + Project Specs)
    // We construct a query to fetch relevant codes for "construction materials and labor"
    const context = await retrieveContext("standard construction materials labor safety regulations", projectId);

    const systemPrompt = `
    You are an expert Construction Auditor and Quantity Surveyor.
    Your job is to audit a Contractor's Estimate/Quote against:
    1. Dubai Building Codes & Best Practices (General Knowledge + Retrieved Context)
    2. Project Specifications (Retrieved Context)

    Context:
    ${context.global}
    ${context.project}

    Analyze the Estimate below for:
    - Overpricing / Anomalies
    - Missing crucial items based on context
    - Compliance risks (e.g. using banned materials)

    Return JSON:
    {
      "compliance_score": 0-100,
      "issues": ["Critical: Missing Fire Rated Door specs", "Warning: Paint price 20% above market"],
      "recommendations": ["Request datasheet for Doors", "Negotiate Paint supply"]
    }
  `;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the Estimate:\n\n${estimateText}` },
            ],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}") as AuditResult;
        return result;

    } catch (error) {
        console.error("Estimate Audit Failed:", error);
        throw new Error("Failed to audit estimate");
    }
}
