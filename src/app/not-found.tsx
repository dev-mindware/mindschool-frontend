import { UnauthorizedLink } from "@/components/common";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground p-6">
      <div className="text-center space-y-8 max-w-2xl w-full">
        <div className="relative inline-flex items-center justify-center group">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 group-hover:bg-primary/15 transition-colors duration-500" />
          <h1 className="text-8xl sm:text-[12rem] font-black text-primary tracking-tighter transition-all duration-700 select-none drop-shadow-2xl group-hover:scale-105">
            404
          </h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12 sm:w-16 sm:h-16 text-primary absolute -top-4 -right-4 animate-bounce drop-shadow-lg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.621a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-3 relative">
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight sm:tracking-tighter">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            O conteúdo que procura não existe ou foi movido.
            Verifique o link ou retorne para o dashboard.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <UnauthorizedLink />
        </div>
      </div>
    </div>
  );
}
