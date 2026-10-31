import type { NextConfig } from "next";

import { CONSENT_HEADERS, CONSENT_PATH } from "./src/lib/mindgest-consent";

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      // Cabeçalhos de segurança em todas as páginas (OWASP A05): sem embutir noutros sites (clickjacking), sem adivinhar tipos, HTTPS obrigatório.
      { source: "/:path*", headers: SECURITY_HEADERS },
      // a página de consentimento do MindGest é mais restrita; vem depois para os seus valores prevalecerem
      { source: CONSENT_PATH, headers: CONSENT_HEADERS },
    ];
  },
  async redirects() {
    return [
      {
        source: "/students",
        destination: "/students/list",
        permanent: false,
      },
      {
        source: "/admissions",
        destination: "/students/admissions",
        permanent: false,
      },
      {
        source: "/enrollments",
        destination: "/students/enrollments",
        permanent: false,
      },
      {
        source: "/guardians",
        destination: "/students/guardians",
        permanent: false,
      },
      {
        source: "/grades",
        destination: "/grades/entry",
        permanent: false,
      },
      {
        source: "/certificates",
        destination: "/certificates/declarations",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
