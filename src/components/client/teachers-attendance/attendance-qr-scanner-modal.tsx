'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Icon, Input, Label } from '@/components';

interface AttendanceQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => Promise<{
    success: boolean;
    type: 'CHECK_IN' | 'CHECK_OUT';
    teacherName: string;
    time: string;
    message: string;
  }>;
}

export function AttendanceQrScannerModal({
  isOpen,
  onClose,
  onScan,
}: AttendanceQrScannerModalProps) {
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    type: 'CHECK_IN' | 'CHECK_OUT';
    teacherName: string;
    time: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScannedCodeInput('');
      setScanResult(null);
    }
  }, [isOpen]);

  const handleSimulateScan = async (codeToScan?: string) => {
    const code = codeToScan || scannedCodeInput;
    if (!code.trim()) return;

    const res = await onScan(code);
    setScanResult(res);
    setScannedCodeInput('');
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Terminal de Ponto por Leitura QR (Portão / Balcão)"
      size="md"
    >
      <div className="space-y-5">
        <div className="space-y-4 rounded-xs border border-border bg-muted/30 p-6 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 p-4 text-primary">
            <Icon name="ScanQrCode" className="size-12 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Aproxime o QR Code do Professor</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Suporta QR Dinâmico da aplicação móvel ou o Cartão Físico institucional.
            </p>
          </div>

          {/* Input Simulado de Leitor Ótico de Balcão */}
          <div className="mx-auto flex max-w-sm items-end gap-2 text-left">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="qr-scanner-input" className="sr-only">
                Código QR lido
              </Label>
              <Input
                id="qr-scanner-input"
                type="text"
                autoFocus
                placeholder="Código lido (MS1.…)"
                value={scannedCodeInput}
                onChange={(e) => setScannedCodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSimulateScan();
                  }
                }}
              />
            </div>
            <Button size="sm" variant="default" className="h-10" onClick={() => void handleSimulateScan()}>
              Confirmar
            </Button>
          </div>
        </div>

        {/* Feedback Visual do Ponto */}
        {scanResult && (
          <div
            className={`rounded-xs border p-4 ${
              scanResult.success
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800/40 dark:bg-rose-950/20 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                name={scanResult.success ? 'CircleCheck' : 'CircleAlert'}
                className={`mt-0.5 size-5 ${scanResult.success ? 'text-emerald-600' : 'text-rose-600'}`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    {scanResult.success
                      ? scanResult.type === 'CHECK_IN'
                        ? 'Check-In Realizado (Entrada)'
                        : 'Check-Out Realizado (Saída)'
                      : 'Erro na Leitura'}
                  </h4>
                  {scanResult.time && <span className="font-mono text-xs font-medium">{scanResult.time}</span>}
                </div>
                {scanResult.teacherName && (
                  <p className="mt-0.5 text-xs font-medium">{scanResult.teacherName}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{scanResult.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlobalModal>
  );
}
