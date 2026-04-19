import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Accede a tu cuenta Demee con Google o enlace mágico por email.",
};

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
