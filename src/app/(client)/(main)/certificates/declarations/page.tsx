import { redirect } from "next/navigation";

export default function CertificatesDeclarationsPage() {
  redirect("/certificates/documents?tab=issued");
}
