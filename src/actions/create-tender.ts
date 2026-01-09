'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateTenderParams {
    propertyId: string
    zone: string
    userRequest: string
    projectId?: string // Optional link to a renovation project
}

interface AIResponse {
    title: string
    scope: string
    estimated_budget: number
    required_skills: string[]
}

export async function createTender({ propertyId, zone, userRequest, projectId }: CreateTenderParams) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // 1b. Compliance Guardrail (Layer 3)
    if (projectId) {
        const { data: project } = await supabase
            .from('projects')
            .select('status')
            .eq('id', projectId)
            .single()

        if (project && project.status === 'permitting') {
            // Check for approved permit
            const { data: permit } = await supabase
                .from('permits')
                .select('id')
                .eq('project_id', projectId)
                .eq('status', 'approved')
                .maybeSingle()

            if (!permit) {
                throw new Error("Cannot start Tender. Waiting for Municipality Approval.")
            }
        }
    }

    // 2. AI Logic via ProxyAPI
    const systemPrompt = `You are an expert Construction Manager and Estimator. 
  Your goal is to convert a raw user request into a professional Tender Specification (Scope of Work).
  
  Zone: ${zone}
  User Request: "${userRequest}"
  
  Output ONLY valid JSON with this structure:
  {
    "title": "Short professional title (e.g., 'Master Bedroom AC Repair')",
    "scope": "Detailed bullet points of work required...",
    "estimated_budget": 500 (Numeric value in AED, conservative estimate),
    "required_skills": ["Plumbing", "Electrical", etc]
  }`

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
                { role: 'user', content: "Generate specs." }
            ],
            temperature: 0.2, // Low temp for consistent JSON
            response_format: { type: "json_object" }
        })
    })

    if (!response.ok) {
        console.error('AI Error:', await response.text())
        throw new Error('Failed to generate tender specs')
    }

    const aiData = await response.json()
    const content = aiData.choices[0].message.content
    let parsed: AIResponse

    try {
        parsed = JSON.parse(content)
    } catch (e) {
        console.error('JSON Parse Error:', content)
        throw new Error('AI returned invalid format')
    }

    // 3. Insert into Database
    const { data, error } = await supabase
        .from('tenders')
        .insert({
            property_id: propertyId,
            owner_id: user.id,
            title: parsed.title,
            scope_of_work: parsed.scope,
            budget_max: parsed.estimated_budget, // This acts as a starting guide
            zone_tag: zone,
            status: 'open',
            project_id: projectId || null
        })
        .select()
        .single()

    if (error) {
        console.error('DB Error:', error)
        throw new Error('Failed to create tender record')
    }

    revalidatePath('/dashboard')
    return { success: true, tenderId: data.id }
}
