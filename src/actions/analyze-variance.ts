"use server";

import { calculateVariance } from "@/lib/analysis/variance";

export async function getVarianceAnalysis(tenderId: string) {
    try {
        const report = await calculateVariance(tenderId);
        return report;
    } catch (error: any) {
        console.error("Variance Analysis Failed:", error);
        throw new Error(error.message || "Failed to analyze variance");
    }
}
