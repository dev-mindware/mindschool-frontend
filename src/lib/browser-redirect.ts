/**
 * Helper isolado para redirects no browser.
 *
 * Existe num módulo separado para ser facilmente mockável em testes.
 * (window.location.replace é read-only em JSDOM 26, daí esta abstração.)
 */

/**
 * Redireciona para a página de login se não estiver já lá.
 * Faz hard redirect (limpa estado/memória do React).
 */
export function redirectToLogin(): void {
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/auth/login") return;
    window.location.replace("/auth/login");
}

/**
 * Redireciona para qualquer path no browser.
 */
export function hardRedirect(path: string): void {
    if (typeof window === "undefined") return;
    if (window.location.pathname === path) return;
    window.location.replace(path);
}