import { AuthInteractiveShell, ResetPassword } from "@/components";

export default function ResetPassPage() {
  return (
    <AuthInteractiveShell
      badge="Ecossistema MindSchool"
      title="Credenciais fortes e protegidas."
      subtitle="Garanta a integridade da conta da sua instituição de ensino e a proteção das pautas confidenciais."
    >
      <ResetPassword />
    </AuthInteractiveShell>
  );
}
