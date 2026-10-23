import type { NextConfig } from "next";

import { CONSENT_HEADERS, CONSENT_PATH } from "./src/lib/mindgest-consent";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: CONSENT_PATH, headers: CONSENT_HEADERS }];
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
