"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Printer,
  Search,
  Scale,
  Building2,
  Mail,
  ExternalLink,
  ChevronRight,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface LegalSectionItem {
  id: string;
  title: string;
  number?: string;
  badge?: string;
}

interface LegalLayoutProps {
  documentType: "TERMS" | "PRIVACY";
  title: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  sections: LegalSectionItem[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  children: React.ReactNode;
}

function LegalThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label="Alternar tema"
      >
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary transition-all rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground transition-all rotate-0 scale-100" />
      )}
    </Button>
  );
}

export function LegalLayout({
  documentType,
  title,
  subtitle,
  effectiveDate,
  version,
  sections,
  searchTerm,
  onSearchChange,
  children,
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isTerms = documentType === "TERMS";

  return (
    <SidebarInset className="bg-background flex flex-1 flex-col min-w-0 w-full min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground print:bg-white print:text-black">
      {/* Top Navigation Bar — Largura Total */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Voltar ao Login & Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xs font-semibold text-xs h-9 border-border/80 hover:bg-muted"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Voltar ao Login</span>
                </Button>
              </Link>

              <div className="h-5 w-px bg-border/80 hidden sm:block" />

              <Link href="/" className="inline-flex items-center gap-2.5">
                <MindSchoolLogo size={32} priority />
                <span className="text-base font-semibold tracking-tight text-foreground">
                  MindSchool<span className="text-primary">.</span>
                </span>
              </Link>
            </div>

            {/* Right: Badge Angola, Imprimir e ThemeToggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold tracking-wide uppercase">
                <Scale className="h-3.5 w-3.5" />
                <span>República de Angola • Lex.ao</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 rounded-xs font-semibold text-xs h-9 border-border/80 hidden sm:inline-flex"
                title="Imprimir ou Guardar em PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir</span>
              </Button>

              <LegalThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Header Section — Largura Total com Conteúdo Centralizado */}
      <section className="w-full border-b border-border/80 bg-muted/20 py-8 sm:py-12 print:py-4">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {isTerms
                  ? "Contrato de Adesão & Termos de Uso • Regime Educativo (MED)"
                  : "Política Geral de Privacidade & Protecção de Dados • APD"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground max-w-4xl leading-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-muted-foreground border-t border-border/60">
            <div>
              <span className="block font-medium text-foreground">Versão Oficial:</span>
              <span>{version}</span>
            </div>
            <div>
              <span className="block font-medium text-foreground">Vigência:</span>
              <span>{effectiveDate}</span>
            </div>
            <div>
              <span className="block font-medium text-foreground">Entidade Gestora:</span>
              <span>MINDWARE — Comércio e Serviços, Lda.</span>
            </div>
            <div>
              <span className="block font-medium text-foreground">Foro Competente:</span>
              <span>Comarca de Luanda, Angola</span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="pt-2 max-w-xl print:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar artigos, cláusulas, MED, AGT, APD ou termos no documento..."
                className="pl-10 h-10 rounded-xs bg-background border-border/80 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Sticky Table of Contents (Coluna Esquerda) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6 print:hidden">
            <div className="border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">
                    Índice de Cláusulas
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5">
                  {sections.length} Secções
                </span>
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1 text-xs">
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 transition-all flex items-center justify-between gap-2 border-l-2 cursor-pointer font-medium",
                        isActive
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <span className="line-clamp-1">
                        {sec.number ? `${sec.number}. ` : ""}
                        {sec.title}
                      </span>
                      {isActive && <ChevronRight className="h-3 w-3 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Gabinete Jurídico & APD Contact Card */}
            <div className="border border-border/80 bg-muted/20 p-4 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <span>Gabinete Jurídico & DPO</span>
              </div>
              <p className="text-muted-foreground">
                Para esclarecimentos contratuais, pedidos ao abrigo da Lei n.º 22/11 ou notificações institucionais:
              </p>
              <div className="space-y-1.5 pt-1">
                <a
                  href="mailto:juridico@mindware.ao"
                  className="flex items-center gap-2 text-foreground hover:text-primary font-semibold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>juridico@mindware.ao</span>
                </a>
                <a
                  href="mailto:dpo@mindware.ao"
                  className="flex items-center gap-2 text-foreground hover:text-primary font-semibold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>dpo@mindware.ao (Privacidade APD)</span>
                </a>
              </div>
              <div className="pt-2 border-t border-border/60">
                <a
                  href="https://apd.ao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
                >
                  <span>Portal Oficial da APD Angola</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Alternate Document Switcher */}
            <div className="border border-border/80 bg-card p-4 text-xs space-y-2">
              <span className="font-semibold text-foreground block">Documento Complementar:</span>
              {isTerms ? (
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Consultar Política de Privacidade (APD)</span>
                </Link>
              ) : (
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Consultar Termos de Utilização do Serviço</span>
                </Link>
              )}
            </div>
          </aside>

          {/* Legal Content (Coluna Direita) */}
          <article className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            {children}
          </article>
        </div>
      </div>

      {/* Footer Legal Padronizado */}
      <footer className="w-full border-t border-border/80 bg-muted/20 py-8 text-xs text-muted-foreground mt-auto print:hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} MINDWARE — Comércio e Serviços, Lda.</span>
            <span>MindSchool • Luanda, República de Angola</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacidade & APD
            </Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Iniciar Sessão
            </Link>
          </div>
        </div>
      </footer>
    </SidebarInset>
  );
}

