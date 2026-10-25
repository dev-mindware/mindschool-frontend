"use client";

import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * «Cancelar» num formulário já preenchido pede confirmação (antes fechava e os dados perdiam-se sem aviso).
 * `request()` fecha logo se não há nada preenchido; senão abre o aviso e só fecha se o utilizador descartar.
 */
export function useDiscardGuard(isDirty: boolean, onClose: () => void): { request: () => void; dialog: ReactNode } {
  const [asking, setAsking] = useState(false);
  const request = () => (isDirty ? setAsking(true) : onClose());
  const dialog = (
    <AlertDialog open={asking} onOpenChange={setAsking}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Descartar os dados preenchidos?</AlertDialogTitle>
          <AlertDialogDescription>Os dados que já escreveu neste formulário perdem-se.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuar a preencher</AlertDialogCancel>
          <AlertDialogAction onClick={() => { setAsking(false); onClose(); }}>Descartar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return { request, dialog };
}
