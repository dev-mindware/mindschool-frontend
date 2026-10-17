import { redirect } from "next/navigation";

export default function CertificateRequestsPage() {
  redirect("/certificates/documents?tab=requests");
}
