import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta Demee en 60 segundos y publica tu mini-web de freelance.",
};

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
