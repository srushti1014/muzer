"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthScreen from "@/components/auth/auth-screen";
import { SignInFlow } from "@/types/auth-type";

export default function InnerAuth() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const authType = searchParams.get("authType") as SignInFlow | null;

  if (session.status === "authenticated") {
    router.push("/");
    return null;
  }

  return <AuthScreen authType={authType ?? "signIn"} />;
}