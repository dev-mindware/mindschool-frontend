"use client";
import { Badge } from "@/components/ui";
import { formatCurrency } from "@/utils";
import type { DocumentVerificationResponse } from "@/types/documents";
import { PublicDocumentHeader } from "./public-document-header";
import { DocumentInfoSection } from "./document-info-section";
import { MarketingCtaSection } from "./marketing-cta-section";

type Props = {
    document: DocumentVerificationResponse;
    token: string;
};

export function DocumentVerificationView({ document, token }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PublicDocumentHeader token={token} documentNumber={document.number} />

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 space-y-8">
                    {/* Payment Status Badge */}
                    <div className="flex justify-end">
                        <Badge
                            variant={document.isPaid ? "success" : "destructive"}
                            className="text-xs"
                        >
                            {document.isPaid ? "PAGO" : "NÃO PAGO"}
                        </Badge>
                    </div>

                    {/* Document Header */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase">
                            DOCUMENTO OFICIAL
                        </p>
                        <h2 className="text-xl font-bold">Factura n.º {document.number}</h2>
                    </div>

                    {/* Issue Date */}
                    <div className="flex justify-end">
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase mb-1">
                                DATA DE EMISSÃO
                            </p>
                            <p className="font-semibold">{formatDate(document.issueDate)}</p>
                        </div>
                    </div>

                    {/* Issuer and Client Info */}
                    <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                        <DocumentInfoSection
                            title="EMISSOR"
                            name={document.company.name}
                            location={document.company.address}
                            taxNumber={document.company.vatNumber}
                            icon="building"
                        />
                        <DocumentInfoSection
                            title="CLIENTE"
                            name={document.client.name}
                            location={document.client.address}
                            taxNumber={document.client.taxNumber}
                            icon="user"
                        />
                    </div>

                    {/* Items Summary */}
                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground uppercase mb-4">
                            RESUMO DOS ITENS
                        </p>
                        <div className="space-y-3">
                            {document.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-start pb-3 border-b last:border-0"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} UN x {formatCurrency(item.unitPrice)}
                                        </p>
                                    </div>
                                    <p className="font-semibold ml-4">
                                        {formatCurrency(item.total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground uppercase">
                                VALOR TOTAL
                            </p>
                            <p className="text-3xl font-bold text-purple-600">
                                {formatCurrency(document.total)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Marketing CTA */}
                <div className="mt-8">
                    <MarketingCtaSection />
                </div>

                {/* Footer */}
                <footer className="text-center mt-8 text-xs text-muted-foreground">
                    © 2026 MINDWARE CORP | TODOS OS DIREITOS RESERVADOS
                </footer>
            </main>
        </div>
    );
}
