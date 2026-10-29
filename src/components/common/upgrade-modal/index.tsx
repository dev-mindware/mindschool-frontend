"use client";
import Link from "next/link";
import { useModal } from "@/stores";
import { Sparkles } from "lucide-react";
import { GlobalModal } from "@/components/modal";
import { Button } from "@/components/ui";

export function UpgradeModal({ feature }: { feature: string }) {
  const { closeModal } = useModal();

  return (
    <GlobalModal
      id="upgrade-modal"
      size="md"
      title={
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Recurso Premium
          </div>
        </div>
      }
    >
      <div className="py-4 space-y-4">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">
            O recurso{" "}
            <span className="font-semibold text-foreground">
              {feature}
            </span>{" "}
            está disponível apenas em planos superiores. Atualize agora e
            desbloqueie todas as funcionalidades!
          </p>
        </div>

        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-2">
            Planos a partir de
          </p>
          <div className="text-2xl font-bold text-foreground">
            5.445,22{" "}
            <span className="text-base font-normal text-muted-foreground">
              kz
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => closeModal("upgrade-modal")}
            className="flex-1"
          >
            Talvez Depois
          </Button>
          <Link
            onClick={(e) => {
              e.stopPropagation();
              closeModal("upgrade-modal");
            }}
            href="/plans"
            target="_blank"
            className="block flex-1"
          >
            <Button className="w-full">
              Ver Planos
            </Button>
          </Link>
        </div>
      </div>
    </GlobalModal>
  );
}
