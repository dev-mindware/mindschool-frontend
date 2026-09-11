"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Button, GlobalModal, Icon } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { itemsService } from "@/services/items-service";
import { ErrorMessage } from "@/utils/messages";
import { playScannerBeep } from "@/utils/audio";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks";
import { useCameraScanner } from "@/hooks/items";
import { CameraOff, AlertCircle } from "lucide-react";

export const BARCODE_SCANNER_MODAL_ID = "barcode-scanner-modal";

const CAMERA_PREVIEW_ID = "barcode-camera-preview";

export function BarcodeScannerModal() {
  const { open, closeModal, openModal } = useModal();
  const isOpen = open[BARCODE_SCANNER_MODAL_ID] || false;
  const isMobile = useIsMobile();

  const [buffer, setBuffer] = useState("");
  const [isLoading, startTransition] = useTransition();

  const handleCheckBarcode = useCallback(
    (code: string) => {
      if (!code) return;

      startTransition(async () => {
        try {
          const { barcode } = await itemsService.checkBarcode(code);

          if (barcode) {
            ErrorMessage("Já existe um produto cadastrado com esse código de barras na base de dados.");
            setBuffer("");
          } else {
            closeModal(BARCODE_SCANNER_MODAL_ID);
            openModal("add-product", { barcode: code });
          }
        } catch {
          ErrorMessage("Ocorreu um erro ao verificar o código de barras.");
          setBuffer("");
        }
      });
    },
    [closeModal, openModal],
  );

  const handleCloseModal = () => {
    closeModal(BARCODE_SCANNER_MODAL_ID);
    setBuffer("");
  };

  useEffect(() => {
    if (!isOpen) setBuffer("");
  }, [isOpen]);

  return (
    <GlobalModal
      id={BARCODE_SCANNER_MODAL_ID}
      className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl"
      title="Leitura de Código de Barras"
      canClose={!isLoading}
    >
      <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8">
        {isMobile ? (
          <MobileCameraScanner
            isActive={isOpen}
            isLoading={isLoading}
            onScan={(code) => {
              playScannerBeep();
              handleCheckBarcode(code);
            }}
          />
        ) : (
          <DesktopKeyboardScanner
            buffer={buffer}
            isLoading={isLoading}
            isOpen={isOpen}
            onBufferChange={setBuffer}
            onSubmit={handleCheckBarcode}
          />
        )}
      </div>

      <div className="flex justify-end px-8 pb-6">
        <Button variant="outline" onClick={handleCloseModal} disabled={isLoading}>
          Fechar
        </Button>
      </div>
    </GlobalModal>
  );
}

type DesktopKeyboardScannerProps = {
  buffer: string;
  isLoading: boolean;
  isOpen: boolean;
  onBufferChange: (value: string) => void;
  onSubmit: (code: string) => void;
};

function DesktopKeyboardScanner({
  buffer,
  isLoading,
  isOpen,
  onBufferChange,
  onSubmit,
}: DesktopKeyboardScannerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter") {
        if (buffer.length > 0) {
          playScannerBeep();
          onSubmit(buffer);
        }
      } else if (e.key === "Backspace") {
        onBufferChange(buffer.slice(0, -1));
      } else if (e.key.length === 1) {
        onBufferChange(buffer + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, buffer, isLoading, onSubmit, onBufferChange]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-primary/15 flex items-center justify-center text-primary shadow-inner">
          <Icon name="Barcode" size={48} />
        </div>
        {isLoading && (
          <div className="absolute inset-0 h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Aguardando Scanner</h2>
        <p className="text-sm text-muted-foreground leading-relaxed px-4">
          Aponte o leitor para o código de barras do produto para iniciar o registo.
        </p>
      </div>

      <div className="w-full py-6 flex flex-col items-center gap-4">
        <div
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/20 text-primary transition-all",
            !isLoading && "animate-bounce-slow",
          )}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full bg-primary",
              !isLoading && "animate-ping",
            )}
          />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            {isLoading ? "Verificando..." : "Pronto para ler"}
          </span>
        </div>

        {buffer.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-mono font-bold tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
              {buffer}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Pressione Enter se o leitor não o fizer
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

type MobileCameraScannerProps = {
  isActive: boolean;
  isLoading: boolean;
  onScan: (code: string) => void;
};

function MobileCameraScanner({ isActive, isLoading, onScan }: MobileCameraScannerProps) {
  const { hasCameraPermission, error, start, stop } = useCameraScanner(CAMERA_PREVIEW_ID);

  const cameraRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && isActive && !isLoading) {
        start(onScan);
      } else if (!node) {
        stop();
      }
    },
    [isActive, isLoading], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">
          {isLoading ? "Verificando..." : "Aponte a câmara"}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed px-2">
          Aponte a câmara para o código de barras. A leitura será feita em todo o visor.
        </p>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden bg-black/5 border border-border">
        <div
          id={CAMERA_PREVIEW_ID}
          ref={cameraRef}
          className="w-full min-h-[200px]"
          aria-label="Preview da câmara para leitura de código de barras"
        />

        {hasCameraPermission === null && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="text-xs text-muted-foreground">A iniciar câmara...</span>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="text-xs text-muted-foreground font-semibold">
              Verificando produto...
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="w-full flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-left">
          <CameraOff className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-destructive">Câmara indisponível</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {hasCameraPermission === true && !isLoading && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary">
          <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Pronto para ler</span>
        </div>
      )}

      {hasCameraPermission === false && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">Permissão de câmara necessária</span>
        </div>
      )}
    </div>
  );
}
