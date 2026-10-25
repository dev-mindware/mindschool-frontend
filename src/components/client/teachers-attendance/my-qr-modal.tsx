"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { GlobalModal } from "@/components";
import api from "@/services/api";
import { getApiErrorMessage } from "@/utils/api-error";

interface MyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** QR dinâmico do próprio professor: o código muda a cada 30 s (impede partilhar o ponto por captura de ecrã). */
export function MyQrModal({ isOpen, onClose }: MyQrModalProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [expires, setExpires] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const { data } = await api.get<{ code: string; expires_at: string; refresh_in_seconds: number }>("/s/attendance/me/qr");
        if (stop) return;
        setError(null);
        setExpires(data.expires_at);
        if (canvas.current) await QRCode.toCanvas(canvas.current, data.code, { width: 240, margin: 1 });
        const wait = Math.max(2000, new Date(data.expires_at).getTime() - Date.now() - 1000);
        timer = setTimeout(load, wait);
      } catch (e) {
        if (!stop) setError(getApiErrorMessage(e, "Não foi possível gerar o QR (só professores com ficha ativa)."));
      }
    };
    void load();
    return () => { stop = true; clearTimeout(timer); };
  }, [isOpen]);

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="O meu QR de ponto" className="!w-[95vw] sm:!max-w-sm">
      <div className="flex flex-col items-center gap-3 py-2">
        {error ? <p className="text-sm text-rose-600 text-center">{error}</p> : <canvas ref={canvas} className="rounded-lg border" />}
        {expires && !error && <p className="text-[11px] text-muted-foreground">Renova automaticamente (válido até {new Date(expires).toLocaleTimeString("pt-AO")}).</p>}
        <p className="text-[11px] text-muted-foreground text-center">Mostre este código no leitor do portão ou do balcão para registar a entrada ou a saída.</p>
      </div>
    </GlobalModal>
  );
}
