"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MFA_ENROLLMENT_EVENT } from "@/lib/mfa-enrollment";
import api from "@/services/api";
import type { ApiMe } from "@/utils/map-api-user";

const SECURITY_URL = "/settings?tab=security";
const DISMISSED_KEY = "mfa-enrollment-dismissed";

const wasDismissed = () => { try { return sessionStorage.getItem(DISMISSED_KEY) === "1"; } catch { return false; } };
const remember = () => { try { sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* sem armazenamento: volta a perguntar */ } };

/**
 * Leva o utilizador a activar o segundo factor quando o seu papel o exige (ver `lib/mfa-enrollment.ts`): logo após o início de sessão
 * (`/auth/me` traz `mfa_enrollment_required`) e também se uma chamada à API for recusada por esse motivo. Montada uma só vez no layout.
 */
export function MfaEnrollmentDialog() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const me = useQuery({ queryKey: ["me-mfa"], queryFn: async () => (await api.get<ApiMe>("/auth/me")).data, staleTime: 0, refetchOnWindowFocus: false, retry: false });
  const required = me.data?.mfa_enrollment_required === true;

  // depois de activar, ao sair das definições a pergunta tem de reflectir o estado novo
  useEffect(() => { void me.refetch(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // pergunta uma vez por sessão do navegador, logo ao entrar
  useEffect(() => { if (required && !wasDismissed()) setOpen(true); }, [required]);

  // uma chamada recusada por falta de 2.º factor volta a abrir a janela, mesmo que tenha sido dispensada
  useEffect(() => {
    const onRequired = () => setOpen(true);
    window.addEventListener(MFA_ENROLLMENT_EVENT, onRequired);
    return () => window.removeEventListener(MFA_ENROLLMENT_EVENT, onRequired);
  }, []);

  const close = () => { remember(); setOpen(false); };
  // nas definições o utilizador já está onde tem de agir
  const onSettings = pathname.startsWith("/settings");

  return (
    <Dialog open={open && !onSettings} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proteja a sua conta com o segundo factor</DialogTitle>
          <DialogDescription>
            O seu perfil exige verificação em dois passos. Leva um minuto: em Configurações › Segurança, escolha «Configurar autenticador» e leia o
            código QR com uma aplicação (Google Authenticator, Microsoft Authenticator, 1Password…). Até lá, algumas áreas ficam indisponíveis.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>Mais tarde</Button>
          <Button asChild onClick={close}><Link href={SECURITY_URL}>Activar agora</Link></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
