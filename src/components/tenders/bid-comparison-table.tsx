'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { analyzeBids } from '@/actions/analyze-bids'
import { awardTender } from '@/actions/manage-tender'
import { Loader2, Trophy, Check, X, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BidComparisonProps {
    tenderId: string
    bids: any[] // In a real app, strict types
}

export function BidComparisonTable({ tenderId, bids }: BidComparisonProps) {
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [awarding, setAwarding] = useState<string | null>(null)

    // Robust default
    const safeBids = bids || [];

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            const result = await analyzeBids(tenderId)
            setAnalysis(result)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAward = async (bidId: string) => {
        if (!confirm('Are you sure you want to award this contract?')) return
        setAwarding(bidId)
        try {
            await awardTender(tenderId, bidId)
        } catch (e) {
            console.error(e)
            setAwarding(null)
        }
    }

    if (safeBids.length < 2 && !analysis) {
        return (
            <div className="text-center p-8 bg-muted/50 rounded-xl border border-dashed">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold">Not enough bids for AI Analysis</h3>
                <p className="text-muted-foreground text-sm mt-1">Wait for at least 2 contractors to bid.</p>
            </div>
        )
    }

    if (!analysis && !loading) {
        return (
            <div className="text-center py-12">
                <Button size="lg" onClick={handleAnalyze} className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                    <Trophy className="h-5 w-5" />
                    Run AI Competitive Analysis
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                    Compare Price, Experience, and Speed automatically.
                </p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="text-center">
                    <p className="font-medium">AI is reading the proposals...</p>
                    <p className="text-sm text-muted-foreground">Analysing 25+ data points</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AI Recommendation Card */}
            <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <Trophy className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-purple-900">AI Recommendation: {analysis.recommendation.winner_name}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-purple-800 leading-relaxed">
                        {analysis.recommendation.reasoning}
                    </p>
                </CardContent>
            </Card>

            {/* Comparison Matrix */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-4 text-left font-medium text-muted-foreground">Criteria</th>
                                {analysis.comparison_matrix.contractors.map((c: any) => (
                                    <th key={c.name} className="p-4 text-left font-semibold text-foreground">
                                        {c.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {/* Scores Rows */}
                            {analysis.comparison_matrix.criteria.map((criteria: string, idx: number) => (
                                <tr key={criteria}>
                                    <td className="p-4 font-medium">{criteria}</td>
                                    {analysis.comparison_matrix.contractors.map((c: any) => (
                                        <td key={c.name} className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${c.scores[idx] >= 8 ? 'bg-green-500' : c.scores[idx] >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${c.scores[idx]}0%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold">{c.scores[idx]}/10</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Pros Row */}
                            <tr>
                                <td className="p-4 font-medium align-top">Pros</td>
                                {analysis.comparison_matrix.contractors.map((c: any) => (
                                    <td key={c.name + 'pros'} className="p-4 align-top">
                                        <ul className="space-y-1">
                                            {c.pros.map((p: string) => (
                                                <li key={p} className="flex items-start text-xs text-green-700">
                                                    <Check className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                ))}
                            </tr>

                            {/* Cons Row */}
                            <tr>
                                <td className="p-4 font-medium align-top">Cons</td>
                                {analysis.comparison_matrix.contractors.map((c: any) => (
                                    <td key={c.name + 'cons'} className="p-4 align-top">
                                        <ul className="space-y-1">
                                            {c.cons.map((p: string) => (
                                                <li key={p} className="flex items-start text-xs text-red-700">
                                                    <X className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                ))}
                            </tr>

                            {/* Action Row */}
                            <tr className="bg-muted/20">
                                <td className="p-4"></td>
                                {analysis.comparison_matrix.contractors.map((c: any, i: number) => {
                                    const matchingBid = safeBids.find(b =>
                                        ((b.profiles?.company_name || b.profiles?.full_name) === c.name)
                                        || c.name.includes('Unknown') // Fallback match
                                    )
                                    return (
                                        <td key={c.name + 'action'} className="p-4">
                                            {matchingBid && (
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    variant={awarding === matchingBid.id ? 'secondary' : 'default'}
                                                    disabled={!!awarding}
                                                    onClick={() => handleAward(matchingBid.id)}
                                                >
                                                    {awarding === matchingBid.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Award Contract'
                                                    )}
                                                </Button>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
