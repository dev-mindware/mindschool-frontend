import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificação de Documento | MindGest",
  description: "Verifique a autenticidade do seu documento fiscal",
};

export default function DocumentVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

