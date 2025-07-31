"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

const Appbar = () => {
  const session = useSession();
  return (
    <nav className="relative z-10 border-b border-gray-700/30 bg-gray-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-4 md:px-10 xl:px-20">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent hover:from-purple-300 hover:via-white hover:to-purple-400 transition duration-300 cursor-pointer">
            Muzi
          </h1>
        </div>

        {/* Sign In Button */}
        <div>
          {session.data?.user && (
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-2.5 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-200 transform hover:scale-105 border border-purple-500/20" onClick={() => signOut()}>
              SignOut
            </Button>
          )}
          {!session.data?.user && (
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-2.5 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-200 transform hover:scale-105 border border-purple-500/20" onClick={() => signIn()}>
              SignIn
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Appbar;
