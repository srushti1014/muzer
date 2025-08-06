"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function GetStarted() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session) {
      router.push("/home");
    } else {
      toast.info("Login first!", {
        position: "top-right",
      });
    }
  };

  return (
    <Button
      className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
      onClick={handleClick}
    >
      Get Started
    </Button>
  );
}
