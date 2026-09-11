"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGetCurrentSession } from "@/hooks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    Icon,
} from "@/components";
import { currentStoreStore, useAuthStore } from "@/stores";
import { Loader2 } from "lucide-react";

export function PosSessionGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { logout, isLoggingOut } = useAuthStore();
    const { currentStore } = currentStoreStore();
    const { data: currentSession, isLoading, error } = useGetCurrentSession(currentStore?.id);

    // Paths that require an active session
    const protectedPaths = ["/pos/counter", "/pos/movements"];
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

    // If not a protected path, allow access immediately
    if (!isProtectedPath) return <>{children}</>;

    // Show loading state while checking session
    if (isLoading || isLoggingOut) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                <div className="relative flex flex-col items-center gap-6 p-10 rounded-3xl bg-card border border-primary/5 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 rounded-3xl" />
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={2.5} />
                        <div className="absolute inset-0 h-12 w-12 animate-ping bg-primary/20 rounded-full -z-10" />
                    </div>
                    <div className="text-center space-y-1.5 relative">
                        <p className="text-lg font-outfit font-bold text-foreground tracking-tight">Verificando POS</p>
                        <p className="text-sm text-muted-foreground font-medium animate-pulse">Aguarde um momento...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If there is an active session, allow access
    if (currentSession?.isOpen) {
        return <>{children}</>;
    }

    // Determine if the error is a 404 (No session found)
    const isNotFound = (error as any)?.response?.status === 404;

    // Otherwise, show blocking modal
    const hasSession = !!currentSession;
    const isClosed = hasSession && !currentSession.isOpen;
    const noSessionFound = isNotFound || (!isLoading && !currentSession);

    // If it's a real error (not a 404), and we don't have a session, show error state
    if (error && !isNotFound) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-destructive/20 shadow-2xl space-y-6 text-center">
                    <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                        <Icon name="CircleX" className="w-10 h-10 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black font-outfit">Erro de Conexão</h2>
                        <p className="text-muted-foreground font-medium">
                            Não foi possível verificar o estado do terminal. Por favor, verifique sua conexão ou tente novamente.
                        </p>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full h-12 rounded-xl font-bold font-outfit"
                    >
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Dialog open={true}>
            <DialogContent
                className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="bg-gradient-to-br from-background via-background to-muted/30 p-8 space-y-8">
                    <DialogHeader className="flex flex-col items-center text-center gap-6">
                        <div className="relative group">
                            <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full ${isClosed ? "bg-amber-500" : "bg-red-500"}`} />
                            <div className={`relative p-6 rounded-2xl shadow-inner border border-white/10 ${isClosed ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                                <Icon
                                    name={isClosed ? "TriangleAlert" : "Lock"}
                                    className={`w-12 h-12 ${isClosed ? "text-amber-600" : "text-red-600"}`}
                                    strokeWidth={2.5}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-3xl text-center font-outfit font-black tracking-tight leading-none">
                                {isClosed ? "Sessão Encerrada" : "Acesso Restrito"}
                            </DialogTitle>
                            <DialogDescription className="text-base font-medium text-muted-foreground leading-relaxed px-4">
                                {isClosed
                                    ? "Esta sessão de caixa já foi finalizada. Para continuar operando no POS, é necessário iniciar um novo turno."
                                    : "Para aceder ao terminal de vendas, é necessário ter uma sessão de caixa aberta associada ao seu utilizador."
                                }
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={() => router.push("/pos/settings")}
                        >
                            <Icon name="Settings" className="h-5 w-5" />
                            Configurar Sessão
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => logout()}
                        >
                            <Icon name="LogOut" className="h-4 w-4" />
                            Terminar Sessão
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
