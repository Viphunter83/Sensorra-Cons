"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function seedDemoData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    console.log("Starting demo seed for user:", user.id);

    // 1. Create Property
    const { data: property, error: propError } = await supabase
        .from("properties")
        .insert({
            owner_id: user.id,
            title: "Penthouse 42, Burj Khalifa Zone",
            address: "1 Sheikh Mohammed bin Rashid Blvd, Dubai",
            type: "residential",
            status: "active"
        })
        .select()
        .single();

    if (propError) throw propError;
    console.log("Created Property:", property.id);

    // 2. Create Project
    const { data: project, error: projError } = await supabase
        .from("projects")
        .insert({
            property_id: property.id,
            title: "Luxury Modern Renovation",
            status: "design",
            description: "Complete overhaul of the living and dining areas.",
            start_date: new Date().toISOString()
        })
        .select()
        .single();

    if (projError) throw projError;
    console.log("Created Project:", project.id);

    // 3. Create Master BoQ
    const { data: boq, error: boqError } = await supabase
        .from("master_boq")
        .insert({
            project_id: project.id,
            status: "approved",
            total_estimated_cost: 150000,
            currency: "AED"
        })
        .select()
        .single();

    if (boqError) throw boqError;

    // 4. Create BoQ Items
    const boqItemsData = [
        {
            master_boq_id: boq.id,
            item_code: "FL-01",
            description: "Supply and install Italian Carrara Marble flooring (60x60cm).",
            unit: "m2",
            quantity: 120,
            estimated_rate: 450,
            category: "Flooring",
            specification_reference: "Section 09 30 00"
        },
        {
            master_boq_id: boq.id,
            item_code: "PT-02",
            description: "Apply 3 coats of Jotun Fenomastic My Home Rich Matt paint.",
            unit: "m2",
            quantity: 350,
            estimated_rate: 45,
            category: "Painting",
            specification_reference: "Section 09 91 00"
        },
        {
            master_boq_id: boq.id,
            item_code: "EL-03",
            description: "Install Smart LED Track Lighting System (Dimmable, Dali Protocol).",
            unit: "lm",
            quantity: 40,
            estimated_rate: 250,
            category: "Electrical",
            specification_reference: "Section 26 51 00"
        }
    ];

    const { data: boqItems, error: itemsError } = await supabase
        .from("boq_items")
        .insert(boqItemsData)
        .select();

    if (itemsError) throw itemsError;
    console.log("Created BoQ Items:", boqItems.length);

    // 5. Create Space (3D)
    const { data: space, error: spaceError } = await supabase
        .from("spaces")
        .insert({
            project_id: project.id,
            name: "Living Room",
            dimensions: { l: 8, w: 6, h: 3.5 }, // 48m2 large living room
            model_url: null // Use default box for now
        })
        .select()
        .single();

    if (spaceError) throw spaceError;

    // 6. Create Design Board
    await supabase.from("design_boards").insert({
        space_id: space.id,
        name: "Modern Concept V1",
        items: [] // Empty to start
    });

    revalidatePath("/");
    return { success: true, propertyId: property.id, projectId: project.id };
}
