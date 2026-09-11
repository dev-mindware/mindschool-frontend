"use client";
import { Button } from "@/components/ui";
import { Download } from "lucide-react";
import { usePublicDocumentDownload } from "@/hooks/documents/use-public-document-download";

type Props = {
    token: string;
    documentNumber: string;
};

export function PublicDocumentHeader({ token, documentNumber }: Props) {
    const { mutate: downloadDocument, isPending } = usePublicDocumentDownload();

    const handleDownload = () => {
        downloadDocument({
            token,
            filename: `${documentNumber}.pdf`,
        });
    };

    return (
        <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">K</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Mindgest</h1>
                            <p className="text-xs text-muted-foreground">
                                PORTAL DE VERIFICAÇÃO
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleDownload}
                        disabled={isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isPending ? "Baixando..." : "PDF Oficial"}
                    </Button>
                </div>
            </div>
        </header>
    );
}
