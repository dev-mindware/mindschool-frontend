"use client";

import React, { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";

export interface PassportPhotoValue {
  file: File;
  previewUrl: string;
  sizeBytes: number;
}

interface PassportPhotoCropperProps {
  value: PassportPhotoValue | null;
  onChange: (val: PassportPhotoValue | null) => void;
  maxBytes?: number; // 1000 KB default
  className?: string;
  label?: string;
  required?: boolean;
}

const MAX_CROP_BYTES = 1000 * 1024; // 1000 KB

export function PassportPhotoCropper({
  value,
  onChange,
  maxBytes = MAX_CROP_BYTES,
  className,
  label = "Foto Tipo Passe (Proporção 3:4)",
  required = true,
}: PassportPhotoCropperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState("foto_passe.jpg");

  // Crop transformations
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // File chosen from user system
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      ErrorMessage("Por favor, selecione um ficheiro de imagem válido (JPEG ou PNG).");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      ErrorMessage("A imagem original é muito grande. Escolha uma foto de até 12 MB.");
      return;
    }

    setRawFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target?.result as string);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so selecting same file triggers change
    e.target.value = "";
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Confirm crop and export 450x600 px JPEG
  const handleConfirmCrop = async () => {
    if (!rawImageSrc || !viewportRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = rawImageSrc;

    await new Promise((resolve) => {
      if (img.complete) resolve(true);
      else img.onload = () => resolve(true);
    });

    const targetWidth = 450;
    const targetHeight = 600; // 3:4 standard aspect ratio

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      ErrorMessage("Erro ao processar imagem no navegador.");
      return;
    }

    const vp = viewportRef.current.getBoundingClientRect();
    const vpWidth = vp.width;
    const vpHeight = vp.height;

    // Background white fill for transparent images
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Compute transformations mapped from viewport to target canvas
    const scaleToTarget = targetWidth / vpWidth;

    ctx.save();
    // Move to canvas center
    ctx.translate(targetWidth / 2, targetHeight / 2);
    // Apply pan scaled
    ctx.translate(pan.x * scaleToTarget, pan.y * scaleToTarget);
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    // Apply zoom
    ctx.scale(zoom * scaleToTarget, zoom * scaleToTarget);

    // Compute base image placement to fit inside viewport
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const vpAspect = vpWidth / vpHeight;

    let baseWidth: number;
    let baseHeight: number;

    if (imgAspect > vpAspect) {
      baseHeight = vpHeight;
      baseWidth = vpHeight * imgAspect;
    } else {
      baseWidth = vpWidth;
      baseHeight = vpWidth / imgAspect;
    }

    ctx.drawImage(
      img,
      -baseWidth / 2,
      -baseHeight / 2,
      baseWidth,
      baseHeight
    );
    ctx.restore();

    // Export to JPEG Blob at 88% quality (well within 1000 KB, typically 60-120 KB)
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          ErrorMessage("Não foi possível gerar a foto tipo passe.");
          return;
        }

        if (blob.size > maxBytes) {
          ErrorMessage(
            `A imagem gerada excede o limite de ${Math.round(maxBytes / 1024)} KB. Tente aproximar menos a imagem.`
          );
          return;
        }

        const cleanName = rawFileName.replace(/\.[^/.]+$/, "") + "_tipo_passe.jpg";
        const file = new File([blob], cleanName, { type: "image/jpeg" });
        // Usar data URL em Base64 para garantir persistência total mesmo após recarregar página ou trocar de conta
        const previewUrl = canvas.toDataURL("image/jpeg", 0.88);

        onChange({
          file,
          previewUrl,
          sizeBytes: blob.size,
        });

        setIsModalOpen(false);
        SucessMessage(
          `Foto tipo passe recortada com sucesso (${Math.round(blob.size / 1024)} KB)!`
        );
      },
      "image/jpeg",
      0.88
    );
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const formatKb = (bytes: number) => {
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Icon name="Camera" className="h-4 w-4 text-primary" />
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          Máx. {Math.round(maxBytes / 1024)} KB
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xs border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center cursor-pointer transition-all hover:border-primary/60 hover:bg-primary/[0.02]"
        >
          <div className="relative flex h-24 w-20 items-center justify-center rounded-xs border-2 border-border/60 bg-muted/40 text-muted-foreground transition-transform group-hover:scale-105 group-hover:border-primary/50 shadow-sm">
            <Icon name="User" className="h-10 w-10 text-muted-foreground/50" />
            <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Icon name="Crop" className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              Carregar e recortar foto tipo passe
            </p>
            <p className="text-[11px] text-muted-foreground">
              Clique para escolher · Proporção exata 3:4 com ferramenta de enquadramento
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xs border border-border bg-card p-3 shadow-xs">
          {/* Preview da foto recortada */}
          <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-xs border border-border bg-muted shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.previewUrl}
              alt="Foto Tipo Passe Recortada"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white">
              3:4
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground truncate">
                {value.file.name}
              </span>
              <Icon name="CheckCircle2" className="h-4 w-4 text-emerald-500 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">{formatKb(value.sizeBytes)}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Formato Padrão 3:4
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 px-2.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Crop" className="h-3.5 w-3.5" />
                Recortar Outra
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2"
                onClick={handleRemove}
              >
                <Icon name="Trash2" className="h-3.5 w-3.5" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interativo de Recorte (Crop Dialog) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md p-5 gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Icon name="Crop" className="h-5 w-5 text-primary" />
              Recortar Foto Tipo Passe (3:4)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Arraste a imagem para centralizar o rosto e use o slider para ajustar o zoom.
            </DialogDescription>
          </DialogHeader>

          {/* Viewport de Recorte 3:4 */}
          <div className="relative mx-auto flex items-center justify-center bg-black/90 rounded-xs overflow-hidden p-3 shadow-inner select-none">
            <div
              ref={viewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={cn(
                "relative w-[210px] h-[280px] overflow-hidden rounded-xs border-2 border-primary/90 shadow-2xl cursor-grab bg-neutral-900",
                isDragging && "cursor-grabbing"
              )}
            >
              {/* Imagem a ser manipulada */}
              {rawImageSrc && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transition: isDragging ? "none" : "transform 0.05s ease-out",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={rawImageSrc}
                    alt="Original"
                    className="max-w-none max-h-none select-none"
                    draggable={false}
                    style={{ width: "210px", height: "auto" }}
                  />
                </div>
              )}

              {/* Guia Oval de Rosto Tipo Passe */}
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-xs flex items-center justify-center">
                <div className="w-[130px] h-[175px] rounded-[50%/60%] border-2 border-dashed border-white/40 shadow-sm" />
                <div className="absolute bottom-2 text-[10px] text-white/70 font-medium px-2 py-0.5 rounded bg-black/40">
                  Enquadre rosto e ombros
                </div>
              </div>
            </div>
          </div>

          {/* Controlos de Zoom e Rotação */}
          <div className="space-y-3 bg-muted/30 p-3 rounded-xs border border-border/60">
            <div className="flex items-center gap-3">
              <Icon name="ZoomOut" className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={(val) => setZoom(Array.isArray(val) ? val[0] : val)}
                className="flex-1"
              />
              <Icon name="ZoomIn" className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-mono w-10 text-right">{zoom.toFixed(1)}x</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleRotate}
              >
                <Icon name="RotateCw" className="h-3.5 w-3.5" />
                Girar 90°
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={handleReset}
              >
                <Icon name="RotateCcw" className="h-3.5 w-3.5" />
                Redefinir
              </Button>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5 font-medium"
              onClick={handleConfirmCrop}
            >
              <Icon name="Check" className="h-4 w-4" />
              Confirmar Recorte (3:4)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
