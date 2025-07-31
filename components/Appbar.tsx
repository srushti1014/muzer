"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

const Appbar = () => {
  const session = useSession();
  return (
    <div className="flex justify-between px-5 py-4 md:px-10 xl:px-20">
      <div>Muzi</div>
      <div>
        {session.data?.user && (
          <Button className="p-2 bg-blue-400" onClick={() => signOut()}>
            SignOut
          </Button>
        )}
        {!session.data?.user && (
          <Button className="p-2 bg-blue-400" onClick={() => signIn()}>
            SignIn
          </Button>
        )}
      </div>
    </div>
  );
};

export default Appbar;
