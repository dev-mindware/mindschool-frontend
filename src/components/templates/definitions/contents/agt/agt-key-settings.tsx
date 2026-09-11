"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  ButtonSubmit,
  Card,
  CardContent,
  Icon,
  Label,
  Separator,
  Textarea,
} from "@/components";
import { useAgtStatus, useUpdateAgtPrivateKey } from "@/hooks/agt";
import {
  agtPrivateKeySchema,
  type AgtPrivateKeyFormData,
} from "@/schemas/agt-schema";
import { ErrorMessage, getApiErrorMessage } from "@/utils";

export function AgtKeySettings() {
  const { data: status, isLoading: isFetchingStatus } = useAgtStatus();
  const { mutateAsync: updatePrivateKey, isPending } = useUpdateAgtPrivateKey();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgtPrivateKeyFormData>({
    resolver: zodResolver(agtPrivateKeySchema),
    defaultValues: { privateKey: "" },
  });

  const hasKey = status?.hasKey ?? false;

  async function onSubmit(data: AgtPrivateKeyFormData) {
    try {
      await updatePrivateKey(data.privateKey);
      reset({ privateKey: "" });
      setIsEditing(false);
    } catch (error) {
      ErrorMessage(
        getApiErrorMessage(error, "Não foi possível actualizar a chave privada."),
      );
    }
  }

  return (
    <div className="w-full mt-6 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Chave Privada AGT</h3>
          <p className="text-sm text-muted-foreground">
            Gestão da chave criptográfica PEM utilizada para assinar documentos fiscais e solicitar séries junto da AGT.
          </p>
        </div>

        {isFetchingStatus ? (
          <Badge variant="outline" className="gap-1.5 py-1 px-3">
            <Icon name="Loader" className="h-3.5 w-3.5 animate-spin" />
            A verificar...
          </Badge>
        ) : hasKey ? (
          <Badge variant="secondary" className="gap-1.5 py-1 px-3 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
            <Icon name="ShieldCheck" className="h-3.5 w-3.5 text-emerald-500" />
            Chave Ativa e Configurada
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1.5 py-1 px-3">
            <Icon name="ShieldAlert" className="h-3.5 w-3.5" />
            Chave Não Configurada
          </Badge>
        )}
      </div>

      {/* Card quando a chave já está configurada e o utilizador não está no modo de edição */}
      {hasKey && !isEditing ? (
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="ShieldCheck" className="h-6 w-6" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-foreground">
                    Chave Privada Registada com Sucesso
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A chave privada da sua empresa está armazenada com encriptação AES-256 e encontra-se ativa para a emissão de faturas, recibos e solicitação de séries fiscais à AGT.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                  <span className="text-xs text-muted-foreground">Estado Criptográfico</span>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Ativo & Encriptado
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                  <span className="text-xs text-muted-foreground">Formato Padrão</span>
                  <p className="text-sm font-medium text-foreground">RSA / PKCS#8 (PEM)</p>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                  <span className="text-xs text-muted-foreground">Assinatura Digital</span>
                  <p className="text-sm font-medium text-foreground">JWS (RS256 - AGT)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Precisa de renovar ou carregar uma nova chave? Substitua a chave existente abaixo.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0 w-full sm:w-auto"
                  onClick={() => setIsEditing(true)}
                >
                  <Icon name="KeyRound" className="h-4 w-4" />
                  Substituir Chave Privada
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Formulário de inserção ou substituição de chave */
        <div className="space-y-6">
          <Alert>
            <Icon name="Info" />
            <AlertTitle>Segurança e Armazenamento Criptografado</AlertTitle>
            <AlertDescription>
              A chave privada fornecida é convertida e encriptada com segurança máxima no servidor (AES-256). Por motivos de conformidade e segurança, o conteúdo original não pode ser visualizado após o envio.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="private-key" className="font-medium">
                  {hasKey ? "Conteúdo da Nova Chave Privada (PEM)" : "Conteúdo da Chave Privada (PEM)"}
                </Label>
                {hasKey && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Irá substituir a chave atualmente em vigor
                  </span>
                )}
              </div>

              <Textarea
                id="private-key"
                placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...&#10;-----END PRIVATE KEY-----"
                className="min-h-56 resize-none font-mono text-xs leading-relaxed"
                {...register("privateKey")}
              />
              {errors.privateKey && (
                <p className="text-xs text-red-500">{errors.privateKey.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Cole o conteúdo completo do ficheiro fornecido pela AGT ou gerado via OpenSSL, incluindo os cabeçalhos <code className="text-primary font-mono text-[11px]">-----BEGIN PRIVATE KEY-----</code> e <code className="text-primary font-mono text-[11px]">-----END PRIVATE KEY-----</code>.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-3">
              {hasKey && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset({ privateKey: "" });
                    setIsEditing(false);
                  }}
                  disabled={isSubmitting || isPending}
                >
                  Cancelar
                </Button>
              )}
              <ButtonSubmit isLoading={isSubmitting || isPending} className="w-max">
                {hasKey ? "Substituir e Ativar Chave" : "Guardar e Ativar Chave"}
              </ButtonSubmit>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
