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
    bids: any[]
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getVarianceAnalysis } from '@/actions/analyze-variance';

export function BidComparisonTable({ tenderId, bids }: BidComparisonProps) {
    const [analysis, setAnalysis] = useState<any>(null)
    const [variance, setVariance] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [awarding, setAwarding] = useState<string | null>(null)

    // Robust default
    const safeBids = bids || [];

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            // Run both analyses
            const [aiResult, varianceResult] = await Promise.all([
                analyzeBids(tenderId),
                getVarianceAnalysis(tenderId)
            ]);
            setAnalysis(aiResult)
            setVariance(varianceResult)
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
                    <p className="text-sm text-muted-foreground">Analysing data points & calculating variances</p>
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

            <Tabs defaultValue="scorecard">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scorecard">AI Scorecard</TabsTrigger>
                    <TabsTrigger value="scope">Scope vs Master (Variance)</TabsTrigger>
                </TabsList>

                {/* TAB 1: SCORECARD */}
                <TabsContent value="scorecard">
                    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-4 text-left font-medium text-muted-foreground">Criteria</th>
                                        {analysis.comparison_matrix.contractors.map((c: any, i: number) => (
                                            <th key={`${c.name}-${i}`} className="p-4 text-left font-semibold text-foreground">
                                                {c.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {analysis.comparison_matrix.criteria.map((criteria: string, idx: number) => (
                                        <tr key={criteria}>
                                            <td className="p-4 font-medium">{criteria}</td>
                                            {analysis.comparison_matrix.contractors.map((c: any, i: number) => (
                                                <td key={`${c.name}-${i}`} className="p-4">
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
                                    <tr>
                                        <td className="p-4 font-medium align-top">Pros</td>
                                        {analysis.comparison_matrix.contractors.map((c: any, i: number) => (
                                            <td key={`${c.name}-pros-${i}`} className="p-4 align-top">
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
                                    <tr>
                                        <td className="p-4 font-medium align-top">Cons</td>
                                        {analysis.comparison_matrix.contractors.map((c: any, i: number) => (
                                            <td key={`${c.name}-cons-${i}`} className="p-4 align-top">
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: VARIANCE MATRIX */}
                <TabsContent value="scope">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan vs Fact Analysis</CardTitle>
                            <CardDescription>Comparing Contractor Bids against Master BoQ.</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {!variance || variance.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No variance data available. Ensure Master BoQ exists and Bids are parsed.
                                </div>
                            ) : (
                                <table className="w-full text-sm border-collapse mt-4">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="p-3 text-left w-[30%]">Master Item</th>
                                            <th className="p-3 text-center w-[10%]">Target Qty</th>
                                            {safeBids.map((bid: any, i: number) => (
                                                <th key={bid.id} className="p-3 text-center border-l w-[30%]">
                                                    Contractor {i + 1}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {variance.map((row: any) => (
                                            <tr key={row.masterItem.id} className="group hover:bg-muted/5">
                                                <td className="p-3 align-top">
                                                    <div className="font-medium text-sm">{row.masterItem.description}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 px-2 py-0.5 bg-muted rounded-full w-fit">
                                                        {row.masterItem.unit}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center font-mono text-sm align-top pt-4">
                                                    {row.masterItem.quantity}
                                                </td>
                                                {safeBids.map((bid: any) => {
                                                    const item = row.bidItems.find((bi: any) => bi.bidId === bid.id);
                                                    if (!item) return <td key={bid.id} className="p-3 text-center border-l text-muted-foreground">-</td>;

                                                    return (
                                                        <td key={bid.id} className="p-3 border-l align-top">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="font-mono font-medium">{item.quantity}</span>

                                                                {item.flags.quantityVariance !== 0 && (
                                                                    <Badge variant={item.flags.isOverScoped ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                                                        {item.flags.quantityVariance > 0 ? '+' : ''}{item.flags.quantityVariance.toFixed(1)}%
                                                                    </Badge>
                                                                )}

                                                                {item.flags.isOverScoped && (
                                                                    <span className="text-[10px] text-red-500 font-medium">Over-scoped!</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Action Row kept separate or at bottom */}
            <div className="flex justify-end gap-4 p-4 border-t bg-muted/10 rounded-lg">
                <span className="text-sm text-muted-foreground self-center">Ready to award?</span>
                {safeBids.map(bid => (
                    <Button
                        key={bid.id}
                        size="sm"
                        variant={awarding === bid.id ? "secondary" : "outline"}
                        onClick={() => handleAward(bid.id)}
                        disabled={!!awarding}
                    >
                        {awarding === bid.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                        Award to Contractor {safeBids.findIndex(b => b.id === bid.id) + 1}
                    </Button>
                ))}
            </div>
        </div>
    )
}

