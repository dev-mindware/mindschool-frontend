import { AuthInteractiveShell, RecoveryPassword } from "@/components";

export default function ForgotPassPage() {
  return (
    <AuthInteractiveShell
      badge="Ecossistema MindSchool"
      title="Acesso seguro e recuperação protegida."
      subtitle="Recuperação de credenciais com verificação de segurança em dois passos e ligação cifrada de ponta a ponta."
    >
      <RecoveryPassword />
    </AuthInteractiveShell>
  );
}
