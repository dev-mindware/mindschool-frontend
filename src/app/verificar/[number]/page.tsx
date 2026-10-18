import { VerifyDocument } from "@/components/public/verify-document";

export const metadata = { title: "Verificação de documentos" };

export default async function VerifyNumberPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <VerifyDocument number={decodeURIComponent(number)} />;
}
