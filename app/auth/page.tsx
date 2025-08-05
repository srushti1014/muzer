"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthScreen from "@/components/auth/auth-screen";
import { SignInFlow } from "@/types/auth-type";

export default function AuthPage() {
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

// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { SignInFlow } from "@/types/auth-type";
// import AuthScreen from "@/components/auth/auth-screen";

// export default function AuthPage({
//   searchParams,
// }: {
//   searchParams: { authType: SignInFlow; mailId?: string };
// }) {
//   const formType = searchParams.authType;
//   const session = useSession();
//   const router = useRouter();

//   if (session.status === "authenticated") {
//     return router.push("/");
//   }
//   return <AuthScreen authType={formType} />;
// }