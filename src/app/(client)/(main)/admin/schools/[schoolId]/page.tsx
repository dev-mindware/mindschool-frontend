"use client";

import { use } from "react";
import { PageWrapper } from "@/components";
import { SchoolDetailContent } from "@/modules/admin/components/school-detail-content";

export default function AdminSchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = use(params);
  return (
    <PageWrapper routePath="/admin/schools" routeLabel="Escolas" subRoute="Ficha da escola" segments={[{ label: "Escolas", href: "/admin/schools" }, { label: "Ficha" }]}>
      <SchoolDetailContent schoolId={schoolId} />
    </PageWrapper>
  );
}
