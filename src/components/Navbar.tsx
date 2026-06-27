"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
      <Link href="/" className="text-2xl font-black tracking-tighter text-white">
        PLAN MY TRIP
      </Link>
      
      <div>
        {status === "loading" ? (
          <div className="w-20 h-10 bg-white/10 animate-pulse rounded-full" />
        ) : session ? (
          <div className="flex items-center gap-4">
            <Link href="/my-trips" className="text-white font-semibold hover:text-teal-300 transition-colors">
              My Trips
            </Link>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <img src={session.user?.image || ""} alt="Avatar" className="w-6 h-6 rounded-full" />
              <span className="text-sm font-medium text-white">{session.user?.name}</span>
              <button onClick={() => signOut()} className="text-xs text-gray-400 hover:text-white ml-2">
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => signIn("google")} 
            className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-6"
          >
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}
