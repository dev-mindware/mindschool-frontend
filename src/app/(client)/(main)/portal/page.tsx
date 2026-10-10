import { redirect } from "next/navigation";

/** O antigo Portal da Família foi dividido em páginas em /familia/*; o início está no dashboard. */
export default function PortalPage() {
  redirect("/dashboard");
}
