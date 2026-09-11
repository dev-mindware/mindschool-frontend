"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components";
import type { User, File as MyFile } from "@/types";
import { PhotoUpload } from "@/components/common/photo-upload";
import { useFileUpload } from "@/hooks/common/use-upload";
import { ErrorMessage, SucessMessage } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, RefreshCw, X } from "lucide-react";
import { getApiAssetUrlCandidates, withCacheBuster } from "@/lib/utils";

export function CompanyLogoForm({ user }: { user: User | null }) {
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
  const [logoCandidateIndex, setLogoCandidateIndex] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoRefreshAttemptedRef = useRef(false);
  const queryClient = useQueryClient();

  const { control, watch, setValue } = useForm<{ companyLogo?: MyFile | null }>();
  const companyLogo = watch("companyLogo");

  const { mutateAsync: uploadLogo, isPending: isUploading } = useFileUpload(
    `/companies/logo`,
    "companies",
    "PUT",
  );

  const logoCandidates = useMemo(
    () =>
      getApiAssetUrlCandidates(user?.company?.logo).map((url) =>
        withCacheBuster(url, logoTimestamp),
      ),
    [user?.company?.logo, logoTimestamp],
  );
  const logoSrc = logoCandidates[logoCandidateIndex] || "";

  useEffect(() => {
    setLogoCandidateIndex(0);
    setLogoFailed(false);
    logoRefreshAttemptedRef.current = false;
  }, [user?.company?.logo, logoTimestamp]);

  const handleUpload = async () => {
    if (!companyLogo) return ErrorMessage("Seleccione um ficheiro antes de actualizar.");

    await uploadLogo(
      { files: { file: companyLogo as MyFile } },
      {
        onSuccess: () => {
          SucessMessage("Logótipo da empresa actualizado com sucesso!");
          setValue("companyLogo", null);
          setIsEditingLogo(false);
          setLogoTimestamp(Date.now());
          // Actualiza o perfil do utilizador em toda a aplicação.
          queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error: any) =>
          ErrorMessage(
            error?.response?.data?.message || "Não foi possível actualizar o logótipo da empresa",
          ),
      },
    );
  };

  if (!user) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Logo da Empresa</h3>
          <p className="text-xs text-muted-foreground">
            Apresentado nos documentos, facturas e recibos do sistema.
          </p>
        </div>
        {user?.company?.logo && (
          <Button
            variant={isEditingLogo ? "ghost" : "outline"}
            size="sm"
            onClick={() => {
              setIsEditingLogo(!isEditingLogo);
              if (isEditingLogo) setValue("companyLogo", null);
            }}
            className="transition-all duration-200"
          >
            {isEditingLogo ? (
              <>
                <X className="w-4 h-4 mr-1.5" /> Cancelar
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-1.5" /> Trocar Logo
              </>
            )}
          </Button>
        )}
      </div>

      {!user?.company?.logo || isEditingLogo ? (
        <div className="flex flex-col gap-4 w-full sm:max-w-md animate-in fade-in duration-200">
          <div className="rounded-xl p-1 bg-muted/5">
            <PhotoUpload
              name="companyLogo"
              control={control}
              info="Suporta PNG, JPG. Máximo 2MB"
              label={user?.company?.logo ? "Arraste ou escolha a nova logo" : "Arraste ou escolha a logo"}
              accept="image"
              maxSize={1024 * 1024 * 2}
              className="w-full"
              disabled={isUploading}
            />
          </div>

          {companyLogo && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full shadow-md transition-all"
            >
              {isUploading ? "A enviar..." : "Guardar novo logótipo"}
            </Button>
          )}
        </div>
      ) : (
        <div 
          onClick={() => setIsEditingLogo(true)}
          className="group relative h-48 w-full sm:w-80 rounded-xl border border-border bg-zinc-50 dark:bg-zinc-950/20 overflow-hidden cursor-pointer shadow-inner flex items-center justify-center p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
          title="Seleccione para alterar o logótipo"
        >
          {/* Fundo quadriculado sutil para destacar logos com transparência */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
            style={{
              backgroundImage: "radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px"
            }}
          />

          {!logoFailed && logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo da empresa"
              className="h-full w-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
              onError={() => {
                setLogoCandidateIndex((currentIndex) => {
                  const nextIndex = currentIndex + 1;

                  if (nextIndex >= logoCandidates.length) {
                    const isSignedLogo = logoCandidates.some((url) =>
                      /[?&](X-Amz-Signature|X-Amz-Credential|Expires|Signature)=/i.test(url),
                    );

                    if (isSignedLogo && !logoRefreshAttemptedRef.current) {
                      logoRefreshAttemptedRef.current = true;
                      queryClient.invalidateQueries({ queryKey: ["user"] });
                    }

                    setLogoFailed(true);
                    return currentIndex;
                  }

                  return nextIndex;
                });
              }}
            />
          ) : (
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Camera className="h-8 w-8" />
              <span className="text-sm font-medium">Não foi possível carregar o logótipo</span>
            </div>
          )}

          {/* Overlay de edição com desfoque e animação premium */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-white z-20">
            <div className="bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Trocar Logo</span>
          </div>
        </div>
      )}
    </div>
  );
}
