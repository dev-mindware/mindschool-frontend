"use client"
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth";

export default function page() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
