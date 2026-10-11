"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MFA_ENROLLMENT_EVENT } from "@/lib/mfa-enrollment";

const SECURITY_URL = "/settings?tab=security";

/** Avisa que o papel do utilizador exige o segundo factor e leva-o a activá-lo (ver `lib/mfa-enrollment.ts`). Montada uma só vez no layout. */
export function MfaEnrollmentDialog() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onRequired = () => setOpen(true);
    window.addEventListener(MFA_ENROLLMENT_EVENT, onRequired);
    return () => window.removeEventListener(MFA_ENROLLMENT_EVENT, onRequired);
  }, []);

  // na página de segurança o utilizador já está onde tem de agir
  const onSecurityPage = pathname.startsWith("/settings");

  return (
    <Dialog open={open && !onSecurityPage} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Active o segundo factor</DialogTitle>
          <DialogDescription>
            O seu perfil exige verificação em dois passos para aceder a esta área. Active-a em Configurações › Segurança com uma aplicação
            de autenticação (Google Authenticator, Microsoft Authenticator, 1Password…) e volte a abrir a página.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Agora não</Button>
          <Button asChild onClick={() => setOpen(false)}><Link href={SECURITY_URL}>Activar agora</Link></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
