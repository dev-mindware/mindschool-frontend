"use client";

import { useEffect } from "react";
import { UnauthorizedLink } from "@/components/common";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useAuth } from "@/hooks/auth";

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";

  useEffect(() => {
    document.title = "Acesso Não Autorizado · MindSchool";
  }, []);

  return (
    <PageWrapper segments={[{ label: "Acesso Não Autorizado" }]}>
      <div className="flex min-h-[70vh] items-center justify-center text-foreground p-6">
        <div className="text-center space-y-8 max-w-2xl w-full">
          <div className="relative inline-flex items-center justify-center group">
            <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full scale-150 group-hover:bg-destructive/15 transition-colors duration-500 animate-pulse" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 sm:w-28 sm:h-28 text-destructive relative drop-shadow-2xl animate-in zoom-in duration-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.093 3.333 1.737 3.333h14.86c1.644 0 2.593-1.833 1.736-3.333L13.73 3.373a1.75 1.75 0 00-3.46 0L2.697 16.126zM12 15.75h.007"
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl font-semibold tracking-tight text-white drop-shadow-md">
              403
            </span>
          </div>

          <div className="space-y-3 relative">
            <h1 className="text-3xl sm:text-5xl font-semibold text-foreground tracking-tight sm:tracking-tighter">
              Acesso Não Autorizado
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              {isTeacher
                ? "O seu perfil de professor não possui permissões para aceder a esta funcionalidade. Se necessita de acesso a este módulo ou turma, solicite a sua atribuição à Direção da escola."
                : "Não possui as permissões necessárias para aceder a este recurso. Verifique as suas atribuições ou contacte o administrador da escola."}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <UnauthorizedLink />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
