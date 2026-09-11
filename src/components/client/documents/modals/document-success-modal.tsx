"use client";

import { useModal } from "@/stores";
import { Button, GlobalModal, Icon } from "@/components";
import { downloadDocument } from "@/services";
import { DocumentType } from "@/types/documents";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";



interface DocumentSuccessModalData {
    id: string;
    type: DocumentType;
    format?: "pdf" | "thermal";
}

export function DocumentSuccessModal() {
    const router = useRouter();
    const { closeModal, open, modalData } = useModal();
    const isOpen = open["document-success"];
    const data = modalData["document-success"] as DocumentSuccessModalData;
    const format = data?.format || "pdf";
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let url: string | null = null;

        async function fetchDocument() {
            if (isOpen && data?.id) {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await downloadDocument(data.id, data.type, format);
                    const blob = new Blob([response.data], { type: "application/pdf" });
                    url = window.URL.createObjectURL(blob);
                    setBlobUrl(url);
                } catch (err) {
                    console.error("Erro ao carregar documento para visualização:", err);
                    setError("Não foi possível carregar a visualização do documento.");
                } finally {
                    setIsLoading(false);
                }
            }
        }
        
        fetchDocument();

        return () => {
            if (url) {
                window.URL.revokeObjectURL(url);
            }
            setBlobUrl(null);
        };
    }, [isOpen, data?.id, data?.type, format]);

    const handlePrint = async () => {
        if (blobUrl) {
            try {
                // Dynamically import print-js only on the client
                const printJS = (await import("print-js")).default;
                printJS({
                    printable: blobUrl,
                    type: "pdf",
                    onPrintDialogClose: () => console.log("The print dialog was closed"),
                    onError: (err: any) => console.error("Print error:", err)
                });
            } catch (err) {
                console.error("Failed to load print-js:", err);
            }
        }
    };

    // Auto-trigger print when blobUrl is ready
    useEffect(() => {
        if (blobUrl && !isLoading && isOpen) {
            // Pequeno delay para garantir que o modal carregou
            const timer = setTimeout(() => {
                handlePrint();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [blobUrl, isLoading, isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        closeModal("document-success");

        if (format === "thermal") return;

        // Map document type to the correct tab in the documents list
        const tabMap: Record<string, string> = {
            invoice: "invoice",
            "invoice-receipt": "invoice-receipt",
            proforma: "proforma",
            receipt: "receipt",
            "credit-note": "credit-notes",
        };

        const tab = tabMap[data.type] || "invoice";
        router.push(`/documents?tab=${tab}&newId=${data.id}`);
    };

    const isThermal = format === "thermal";

    return (
        <GlobalModal
            id="document-success"
            canClose
            title="Documento Criado!"
            description={isThermal ? "Consulte abaixo o talão do documento." : "Consulte abaixo a versão A4 do documento."}
            className={isThermal ? "max-w-md max-h-[90vh] overflow-y-auto" : "max-w-4xl max-h-[90vh] overflow-y-auto"}
        >
            <div className="flex flex-col gap-4 mt-4">
                <div className={isThermal ? "relative w-full aspect-[1/2] bg-muted rounded-lg border overflow-hidden" : "relative w-full aspect-[1/1.4] bg-muted rounded-lg border overflow-hidden"}>
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-10 text-center">
                            <Skeleton className="w-full h-full" />
                            <div className="absolute flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">A carregar a pré-visualização...</p>
                            </div>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center gap-4">
                            <Icon name="FileWarning" className="h-12 w-12 text-destructive" />
                            <p className="text-sm font-medium text-destructive">{error}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </Button>
                        </div>
                    )}

                    {blobUrl && !isLoading && (
                        <iframe
                            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full border-none"
                            title="Pré-visualização do documento"
                        />
                    )}
                </div>

                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        {isThermal ? "Versão Talão" : "Versão A4"}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            className="gap-2"
                            disabled={!blobUrl || isLoading}
                        >
                            <Icon name="Printer" size={16} />
                            Imprimir
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="default"
                            className="w-32"
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </div>
        </GlobalModal>
    );
}
