"use client";

import InnerAuth from "@/components/InnerAuth";
import Loader from "@/components/Loader";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <Suspense fallback={<div><Loader/></div>}>
      <InnerAuth />
    </Suspense>
  );
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