import { redirect } from "next/navigation";

export default function CertificatesIndexPage() {
  redirect("/certificates/declarations");
}
