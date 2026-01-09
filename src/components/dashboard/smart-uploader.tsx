"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { uploadAndAnalyzeDocument } from "@/actions/upload-doc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SmartUploader({ propertyId, projectId, defaultDocType }: { propertyId: string, projectId?: string, defaultDocType?: string }) {
    const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setStatus("uploading");

        // Create FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("property_id", propertyId);
        if (projectId) formData.append("project_id", projectId);
        if (defaultDocType) formData.append("doc_type", defaultDocType);

        try {
            // Step 1: Upload & Analyze (Server Action)
            setStatus("analyzing");
            const result = await uploadAndAnalyzeDocument(formData);

            if (result.error) {
                throw new Error(result.error);
            }

            setStatus("success");
            setMessage(`Successfully analyzed: ${file.name}`);
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setMessage(err.message || "Upload failed");
        }
    }, [propertyId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        }
    });

    return (
        <Card className="p-6 border-dashed border-2 hover:bg-accent/50 transition-colors">
            <div {...getRootProps()} className={cn("flex flex-col items-center justify-center h-48 cursor-pointer gap-4 text-center", status !== "idle" && "pointer-events-none opacity-50")}>
                <input {...getInputProps()} />

                {status === "idle" && (
                    <>
                        <div className="p-4 bg-primary/10 rounded-full">
                            <UploadCloud className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-lg font-medium">Drag & drop construction docs here</p>
                            <p className="text-sm text-muted-foreground">PDF, PNG, JPG (Max 10MB)</p>
                        </div>
                        {isDragActive && <p className="text-primary font-bold animate-pulse">Drop to analyze!</p>}
                    </>
                )}

                {status === "analyzing" && (
                    <div className="flex flex-col items-center gap-2 text-primary">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p className="font-semibold">AI is analyzing document structure...</p>
                        <p className="text-xs text-muted-foreground">Extracting metadata & classifying</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                        <CheckCircle className="h-10 w-10" />
                        <p className="font-semibold">Upload Complete</p>
                        <p className="text-sm">{message}</p>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}>Upload Another</Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-10 w-10" />
                        <p className="font-semibold">Error Occurred</p>
                        <p className="text-sm">{message}</p>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}>Try Again</Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
