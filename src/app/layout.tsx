import type { Metadata } from "next";
import "driver.js/dist/driver.css";
import "./globals.css";
import { ReactQueryProvider } from "@/lib";
// Tipos de letra servidos localmente (sem pedidos ao Google): Outfit é a principal; Inter é uma alternativa de Definições › Aparência.
import "@fontsource-variable/outfit";
import "@fontsource-variable/inter";
import { ThemeProvider } from "@/providers";
import { CustomToaster } from "@/utils";
import { SidebarProvider } from "@/components";
import { AuthProvider } from "@/contexts";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaServiceWorkerRegister } from "@/components/shared/pwa-service-worker-register";
import { AppearancePreferences } from "@/components/shared/appearance-preferences";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mindschool.mindware.ao"),
  title: {
    default: "MindSchool | Sistema Integrado de Gestão Escolar",
    template: "%s | MindSchool",
  },

  description:
    "MindSchool é um sistema integrado de gestão escolar e académica para colégios, instituições de ensino e centros de formação.",

  applicationName: "MindSchool",

  keywords: [
    "MindSchool",
    "gestão escolar",
    "sistema escolar",
    "software escolar Angola",
    "gestão académica",
    "mensalidades",
    "propinas",
    "educação Angola",
    "SaaS Angola",
  ],

  authors: [
    {
      name: "Mindware",
      url: "https://mindware.co.ao",
    },
  ],

  creator: "Mindware",
  publisher: "Mindware",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/Logo_fundo-claro.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/Logo_fundo-escuro.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/Logo_fundo-claro.svg",
        type: "image/svg+xml",
      },
    ],
  },

  openGraph: {
    title: "MindSchool | Sistema Integrado de Gestão Escolar",
    description:
      "Instituições de ensino podem gerir matrículas, estudantes, propinas, turmas e relatórios num único software.",
    url: "https://mindschool.mindware.ao",
    siteName: "MindSchool",
    images: [
      {
        url: "/Logo_fundo-claro.svg",
        width: 974,
        height: 974,
        alt: "MindSchool: Sistema Integrado de Gestão Escolar",
      },
    ],
    locale: "pt_AO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "MindSchool | Sistema Integrado de Gestão Escolar",
    description:
      "Sistema de gestão escolar e académica para colégios e instituições de ensino.",
    images: ["/Logo_fundo-claro.svg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  category: "Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-AO"
      suppressHydrationWarning
      className="font-sans"
    >
      <body
        className="antialiased font-sans"
        style={{ fontFamily: "var(--font-family)" }}
      >
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
          storageKey="mindware-theme"
        >
          <Analytics />
          <SpeedInsights />
          <ReactQueryProvider>
            <AuthProvider>
              <NuqsAdapter>
                <PwaServiceWorkerRegister />
                <AppearancePreferences />
                <SidebarProvider>{children}</SidebarProvider>
                <CustomToaster />
              </NuqsAdapter>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
