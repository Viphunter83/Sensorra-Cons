'use server'

import { createClient } from '@/utils/supabase/server'

interface AnalysisResult {
    comparison_matrix: {
        criteria: string[]
        contractors: {
            name: string
            scores: number[] // 1-10
            pros: string[]
            cons: string[]
        }[]
    }
    recommendation: {
        winner_name: string
        reasoning: string
    }
}

export async function analyzeBids(tenderId: string): Promise<AnalysisResult> {
    const supabase = await createClient()

    // 1. Fetch Data
    const { data: tender } = await supabase
        .from('tenders')
        .select('*')
        .eq('id', tenderId)
        .single()

    const { data: bids } = await supabase
        .from('bids')
        .select(`
      *,
      profiles:contractor_id (full_name, company_name)
    `)
        .eq('tender_id', tenderId)

    if (!tender || !bids || bids.length === 0) {
        throw new Error('Not enough data for analysis')
    }

    // 2. Prepare Prompt
    const bidsText = bids.map((b, i) => `
    Bid ${i + 1}:
    Contractor: ${(b.profiles as any)?.company_name || (b.profiles as any)?.full_name || 'Unknown'}
    Price: ${b.price} AED
    Comment: "${b.comment}"
  `).join('\n')

    const systemPrompt = `You are a Senior Quantity Surveyor (Construction Expert).
  Goal: Compare bids for the scope: "${tender.scope_of_work}".
  Budget Max: ${tender.budget_max} AED.

  Bids:
  ${bidsText}

  Output JSON:
  {
    "comparison_matrix": {
      "criteria": ["Price Value", "Experience/Proposal Quality", "Speed/Availability"],
      "contractors": [
        { "name": "Contractor Name", "scores": [8, 5, 9], "pros": ["Cheap"], "cons": ["No detail"] }
      ]
    },
    "recommendation": {
      "winner_name": "Name",
      "reasoning": "Why they are the best fit..."
    }
  }`

    // 3. Call AI
    const response = await fetch(`${process.env.PROXY_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PROXY_API_KEY}`
        },
        body: JSON.stringify({
            model: process.env.AI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Analyze now." }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
        })
    })

    if (!response.ok) throw new Error('AI Analysis Failed')

    const aiData = await response.json()
    return JSON.parse(aiData.choices[0].message.content)
}
