import { redirect } from "next/navigation";
import { ADMIN_PANEL_URL } from "@/constants/routes";

/** A administração da plataforma passou para o painel próprio; os endereços antigos `/admin/*` reencaminham para lá. */
const MOVED: Record<string, string> = { platform: "/dashboard", schools: "/schools", users: "/users", impersonations: "/impersonations", security: "/security" };

export default async function AdminMovedPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const [section, ...rest] = (await params).path ?? [];
  const target = section && MOVED[section] ? [MOVED[section], ...rest].join("/") : "/dashboard";
  redirect(`${ADMIN_PANEL_URL}${target}`);
}
