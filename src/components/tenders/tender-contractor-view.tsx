'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, CheckCircle } from 'lucide-react';
import { submitBid } from '@/actions/tender-actions';

interface ContractorViewProps {
    tender: any;
    userId?: string;
}

export function TenderContractorView({ tender, userId }: ContractorViewProps) {
    const [price, setPrice] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [extractedItems, setExtractedItems] = useState<any[]>([]);
    const [submitted, setSubmitted] = useState(false);

    // Filter if already submitted
    const existingBid = tender.bids.find((b: any) => b.contractor_id === userId);

    if (existingBid) {
        return (
            <Card className="max-w-xl mx-auto border-green-200 bg-green-50">
                <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                    <div>
                        <h2 className="text-xl font-semibold text-green-800">Bid Submitted</h2>
                        <p className="text-green-700">You submitted a bid of ${existingBid.price} on {new Date(existingBid.created_at).toLocaleDateString()}.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);

            // Simulating AI Analysis for Demo
            setAnalyzing(true);
            setTimeout(() => {
                setExtractedItems([
                    { description: "Demolition of existing walls", quantity: 1, unit_price: 500, total_price: 500 },
                    { description: "New Drywall Installation", quantity: 120, unit_price: 45, total_price: 5400 },
                    { description: "Electrical Wiring (Basic)", quantity: 1, unit_price: 1200, total_price: 1200 },
                ]);
                setPrice("7100");
                setAnalyzing(false);
            }, 2500);
        }
    };

    const handleSubmit = async () => {
        if (!file || !price) return;

        try {
            // In real app, upload file to Storage first.
            const fakePdfUrl = "https://example.com/quote.pdf";

            await submitBid(tender.id, parseFloat(price), fakePdfUrl, extractedItems);
            setSubmitted(true);
        } catch (e) {
            alert("Failed to submit bid");
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Tender Info */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Scope of Work</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 whitespace-pre-wrap">{tender.scope_of_work || "No specific scope description provided."}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Submission Form */}
            <div className="space-y-6">
                <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="bg-blue-50/50">
                        <CardTitle>Submit Proposal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <>
                                    <FileText className="w-10 h-10 text-blue-500 mb-2" />
                                    <span className="font-medium text-slate-900">{file.name}</span>
                                    <span className="text-sm text-green-600">AI Analysis Complete</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-slate-400 mb-2" />
                                    <span className="font-medium text-slate-700">Upload Quote (PDF)</span>
                                    <span className="text-sm text-slate-500">Drag & drop or click to browse</span>
                                </>
                            )}
                        </div>

                        {analyzing && (
                            <div className="flex items-center gap-2 text-sm text-purple-600 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing PDF with Sensorra AI...
                            </div>
                        )}

                        {extractedItems.length > 0 && (
                            <div className="bg-slate-50 rounded-lg p-3 text-sm border">
                                <p className="font-semibold mb-2">Extracted {extractedItems.length} line items:</p>
                                <ul className="space-y-1 text-slate-600">
                                    {extractedItems.map((i, idx) => (
                                        <li key={idx} className="flex justify-between">
                                            <span>{i.description}</span>
                                            <span>${i.total_price}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Total Bid Price</Label>
                            <Input
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="text-lg font-semibold"
                            />
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!file || analyzing || submitted}
                        >
                            {submitted ? "Submitted Successfully" : "Submit Bid"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
