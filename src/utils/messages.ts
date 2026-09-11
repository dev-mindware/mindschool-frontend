import { toast } from "sonner";

export function SucessMessage(message: string | null) {
  toast.success(message);
}

export function ErrorMessage(message: string | null) {
  toast.error(message);
}

export function WarningMessage(message: string | null) {
  toast.warning(message);
}

export function InfoMessage(message: string | null) {
  toast.info(message);
}
