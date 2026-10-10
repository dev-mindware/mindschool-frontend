'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Icon } from '@/components';

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
      className="!w-[95vw] sm:!max-w-xl lg:!max-w-2xl"
    >
      <div className="space-y-5">
        <div className="text-center p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 text-primary rounded-full border border-primary/40">
            <Icon name="ScanQrCode" className="w-12 h-12 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Aproxime o QR Code do Professor</h3>
            <p className="text-xs text-slate-400 mt-1">
              Suporta QR Dinâmico da aplicação móvel ou o Cartão Físico institucional.
            </p>
          </div>

          {/* Input Simulado de Leitor Ótico de Balcão */}
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              autoFocus
              placeholder="Código lido (MS1.…)"
              value={scannedCodeInput}
              onChange={(e) => setScannedCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSimulateScan();
                }
              }}
              className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <Button size="sm" variant="default" onClick={() => handleSimulateScan()}>
              Confirmar
            </Button>
          </div>
        </div>

        {/* Feedback Visual do Ponto */}
        {scanResult && (
          <div
            className={`p-4 rounded-xl border ${
              scanResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                name={scanResult.success ? 'CircleCheck' : 'CircleAlert'}
                className={`w-5 h-5 mt-0.5 ${scanResult.success ? 'text-emerald-600' : 'text-rose-600'}`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">
                    {scanResult.success
                      ? scanResult.type === 'CHECK_IN'
                        ? 'Check-In Realizado (Entrada)'
                        : 'Check-Out Realizado (Saída)'
                      : 'Erro na Leitura'}
                  </h4>
                  {scanResult.time && <span className="text-xs font-mono font-medium">{scanResult.time}</span>}
                </div>
                {scanResult.teacherName && (
                  <p className="text-xs font-medium mt-0.5">{scanResult.teacherName}</p>
                )}
                <p className="text-xs mt-1 text-muted-foreground">{scanResult.message}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </GlobalModal>
  );
}
