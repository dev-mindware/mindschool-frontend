"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import JsBarcode from "jsbarcode";
import { Wand2, Download } from "lucide-react";
import { Button, Input } from "@/components";
import type { User } from "@/types";
import { useUpdateUser } from "@/hooks/users";
import {
  downloadBarcodePng,
  ErrorMessage,
  generateBarcode,
  SucessMessage,
} from "@/utils";
import { cn } from "@/lib";

const barcodeSchema = z.object({
  barcode: z
    .string()
    .trim()
    .min(4, "O código de barras deve ter, pelo menos, 4 caracteres")
    .max(64, "O código de barras deve ter, no máximo, 64 caracteres"),
});

type BarcodeFormData = z.infer<typeof barcodeSchema>;

export function ProfileBarcodeForm({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mutateAsync: updateProfile, isPending } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BarcodeFormData>({
    resolver: zodResolver(barcodeSchema),
    defaultValues: {
      barcode: user.barcode || "",
    },
  });

  const barcodeValue = watch("barcode");

  useEffect(() => {
    reset({ barcode: user.barcode || "" });
  }, [user.barcode, reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const value = barcodeValue?.trim();
    if (!canvas || !value) return;

    try {
      JsBarcode(canvas, value, {
        format: "CODE128",
        width: 2,
        height: 64,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch {
      // Invalid barcode for rendering — keep previous canvas state
    }
  }, [barcodeValue]);

  async function onSubmit(data: BarcodeFormData) {
    if (data.barcode === user.barcode) {
      SucessMessage("Código de barras actualizado com sucesso!");
      setIsEditing(false);
      return;
    }

    await updateProfile(
      { barcode: data.barcode },
      {
        onSuccess: () => {
          SucessMessage("Código de barras actualizado com sucesso!");
          setIsEditing(false);
        },
        onError: (error: any) => {
          ErrorMessage(
            error?.response?.data?.message ||
              "Não foi possível actualizar o código de barras",
          );
        },
      },
    );
  }

  function handleGenerate() {
    setValue("barcode", generateBarcode(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleDownload() {
    const value = barcodeValue?.trim();
    if (!value) {
      ErrorMessage("Não há código de barras para descarregar.");
      return;
    }
    try {
      downloadBarcodePng(value, `barcode-${user.name.replace(/\s+/g, "-").toLowerCase()}.png`);
      SucessMessage("Código de barras descarregado.");
    } catch {
      ErrorMessage("Não foi possível gerar a imagem PNG do código de barras.");
    }
  }

  function handleCancel() {
    reset({ barcode: user.barcode || "" });
    setIsEditing(false);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card rounded-lg border p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">Código de Barras</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Usado para autorizações no POS e nas notas de crédito.
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!barcodeValue?.trim()}
          >
            <Download className="size-4 mr-1.5" />
            PNG
          </Button>
          <Button
            type="button"
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) handleCancel();
              else setIsEditing(true);
            }}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>
      </div>

      <div
        className={cn("space-y-4", {
          "pointer-events-none": !isEditing,
        })}
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Código
          </label>
          <div className="flex items-start gap-2">
            <Input
              startIcon="Barcode"
              placeholder="Introduza ou gere o código de barras"
              {...register("barcode")}
              readOnly={!isEditing}
              error={errors.barcode?.message}
              className="bg-background shadow-none"
            />
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Gerar código de barras"
                aria-label="Gerar código de barras"
                onClick={handleGenerate}
              >
                <Wand2 className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {barcodeValue?.trim() && (
          <div className="flex justify-center rounded-md border bg-white p-4">
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end border-t pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "A guardar..." : "Guardar alterações"}
          </Button>
        </div>
      )}
    </form>
  );
}
