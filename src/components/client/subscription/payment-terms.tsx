import Link from "next/link";

export function PaymentTerms() {
  return (
    <div className="text-center text-xs text-gray-500">
      Ao enviar o comprovativo de pagamento, declara que concorda com os nossos{" "}
      <Link href="/terms-policy" className="text-primary-600 hover:underline">
        Termos e políticas
      </Link>{" "}
      e{" "}
      <Link href="/privacity" className="text-primary-600 hover:underline">
        Política de Privacidade
      </Link>
    </div>
  );
}
