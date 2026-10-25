import { toast } from "sonner";

// Os erros ficam mais tempo no ecrã (o padrão de ~3 s não chega para ler uma regra de negócio) e podem fechar-se à mão.
const ERROR_MS = 9000;
const WARNING_MS = 7000;

export function SucessMessage(message: string | null | undefined) {
  toast.success(message);
}

export function ErrorMessage(message: string | null | undefined) {
  toast.error(message, { duration: ERROR_MS, closeButton: true });
}

export function WarningMessage(message: string | null | undefined) {
  toast.warning(message, { duration: WARNING_MS, closeButton: true });
}

export function InfoMessage(message: string | null | undefined) {
  toast.info(message);
}
