import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function MarketingCtaSection() {
    return (
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
            <p className="text-sm italic mb-4 opacity-90">
                "Tecnologia a favor do seu crescimento."
            </p>
            <h2 className="text-2xl font-bold mb-2">
                Mindgest: o futuro da sua gestão empresarial começa agora.
            </h2>
            <Link href="/auth/register">
                <Button
                    variant="secondary"
                    className="mt-4 bg-background text-primary hover:bg-background/90"
                >
                    Conheça o Mindgest
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Link>
        </div>
    );
}
