import { toast } from "sonner";

export function SucessMessage(message: string | null | undefined) {
  toast.success(message);
}

export function ErrorMessage(message: string | null | undefined) {
  toast.error(message);
}

export function WarningMessage(message: string | null | undefined) {
  toast.warning(message);
}

export function InfoMessage(message: string | null | undefined) {
  toast.info(message);
}
