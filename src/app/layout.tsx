import type { Metadata } from "next";
import "driver.js/dist/driver.css";
import "./globals.css";
import { ReactQueryProvider } from "@/lib";
import {
  Inter,
  Outfit,
  Roboto,
  Poppins,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/providers";
import { CustomToaster } from "@/utils";
import { SidebarProvider } from "@/components";
import { AuthProvider } from "@/contexts";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaServiceWorkerRegister } from "@/components/shared/pwa-service-worker-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

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
        url: "/mindgest.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/mindgest.png",
        type: "image/png",
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
        url: "/mindgest.png",
        width: 1200,
        height: 630,
        alt: "MindSchool: sistema de gestão escolar",
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
    images: ["/mindgest.png"],
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
      className={`${inter.variable} ${outfit.variable} ${roboto.variable} ${poppins.variable} ${plusJakartaSans.variable}`}
    >
      <body
        className="antialiased"
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
