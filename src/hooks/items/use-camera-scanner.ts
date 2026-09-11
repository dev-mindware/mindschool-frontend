"use client";

import { useRef, useState, useCallback } from "react";
import type { Html5Qrcode as Html5QrcodeType } from "html5-qrcode";

type UseCameraScannerResult = {
  hasCameraPermission: boolean | null;
  error: string | null;
  isScanning: boolean;
  isPaused: boolean;
  start: (onScan: (code: string) => void) => Promise<void>;
  stop: () => Promise<void>;
};


const SCANNER_CONFIG = { 
  fps: 15,
  aspectRatio: 1.0
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useCameraScanner(elementId: string): UseCameraScannerResult {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeType | null>(null);
  const isLockedRef = useRef(false);

  const stop = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {}
    scannerRef.current = null;
    setIsScanning(false);
    setIsPaused(false);
    isLockedRef.current = false;
  }, []);

  const start = useCallback(
    async (onScan: (code: string) => void) => {
      await stop();

      const COOLDOWN_MS = 2000; // 2 seconds between scans

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        const tryStart = async (constraints: MediaTrackConstraints | string) => {
          const scanner = new Html5Qrcode(elementId);
          try {
            await scanner.start(
              constraints as string,
              SCANNER_CONFIG,
              (code) => {
                // If we are currently in lockout, ignore
                if (isLockedRef.current) return;
                
                isLockedRef.current = true;
                setIsPaused(true);
                
                onScan(code);
                
                // Keep it paused and locked to prevent rapid duplicates
                // as requested: "scanneou uma vez e para"
                setTimeout(() => {
                  isLockedRef.current = false;
                  setIsPaused(false);
                }, COOLDOWN_MS);
              },
              () => {},
            );
            scannerRef.current = scanner;
            return true;
          } catch {
            try {
              scanner.clear();
            } catch {}
            return false;
          }
        };

        const ok =
          (await tryStart({ facingMode: { ideal: "environment" } })) ||
          (await wait(300), await tryStart({ facingMode: "environment" })) ||
          (await wait(300), await tryStart({ facingMode: "user" }));

        if (!ok) throw new Error("no_camera");

        setIsScanning(true);
        setHasCameraPermission(true);
        setError(null);
      } catch (err: unknown) {
        setHasCameraPermission(false);
        scannerRef.current = null;

        const msg = err instanceof Error ? err.message.toLowerCase() : "";

        if (msg.includes("permission") || msg.includes("notallowed")) {
          setError("Acesso à câmara negado. Active as permissões nas definições do navegador.");
        } else if (msg.includes("notfound")) {
          setError("Nenhuma câmara detectada neste dispositivo.");
        } else {
          setError("Não foi possível iniciar a câmara. Tente novamente.");
        }
      }
    },
    [elementId, stop],
  );

  return { hasCameraPermission, error, isScanning, isPaused, start, stop };
}
