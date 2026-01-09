"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { analyzeEstimate, AuditResult } from "@/actions/analyze-estimate";


interface BidAuditorProps {
    estimateText: string;
    projectId?: string;
}

export function BidAuditor({ estimateText, projectId }: BidAuditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AuditResult | null>(null);

    async function runAudit() {
        setLoading(true);
        try {
            const audit = await analyzeEstimate(estimateText, projectId);
            setResult(audit);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={runAudit}>
                    <Bot size={20} className="text-purple-500" />
                    AI Compliance Audit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bot size={24} className="text-purple-600" />
                        AI Smart Auditor
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="animate-spin" size={40} />
                            <p>Analyzing against Dubai Regulations...</p>
                        </div>
                    ) : result ? (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-6">
                                {/* Scorecard */}
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="pt-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-700">Compliance Score</h3>
                                            <p className="text-sm text-slate-500">Based on Building Codes & Specs</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-4xl font-bold ${result.compliance_score >= 80 ? 'text-green-600' :
                                                result.compliance_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {result.compliance_score}
                                            </span>
                                            <span className="text-xl text-slate-400">/ 100</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Issues */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <AlertTriangle size={20} className="text-orange-500" />
                                        Identified Risks
                                    </h4>
                                    <div className="space-y-3">
                                        {result.issues.length === 0 && (
                                            <p className="text-green-600 flex items-center gap-2">
                                                <CheckCircle size={20} /> No risks found.
                                            </p>
                                        )}
                                        {result.issues.map((issue, i) => (
                                            <div key={i} className="p-3 rounded-lg border bg-white shadow-sm border-l-4 border-l-red-500 flex gap-3">
                                                <XCircle size={20} className="text-red-500 shrink-0 mt-1" />
                                                <p className="text-sm text-slate-700">{issue}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-500" />
                                        Recommendations
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-slate-600 bg-green-50 px-3 py-2 rounded-md border border-green-100">
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Click to start audit.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
