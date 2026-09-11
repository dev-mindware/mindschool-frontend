import Link from "next/link";

export function BackToLogin() {
  return (
    <div className="w-full flex items-center justify-center">
      <Link
        href="/auth/login"
        className="w-max text-primary block text-sm"
      >
        Voltar para o login
      </Link>
    </div>
  );
}
