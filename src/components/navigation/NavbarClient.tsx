"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LayoutGrid } from "lucide-react";
import { Icons } from "../Icons";
import UserAccountNav from "./UserAccountNav";
import { Session } from "next-auth";

type NavbarClientProps = {
  session: Session | null;
};

export default function NavbarClient({ session }: NavbarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDashboardClick = () => {
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  return (
    <header className="inset-x-0 flex justify-center items-center bg-zinc-950 z-[10] h-[8vh] px-11 max-sm:px-4 border-b border-zinc-800">
      <div className="w-full h-full mx-auto flex items-center justify-between max-sm:grid max-sm:grid-cols-3">
        {/* ✅ Left: Dashboard Button */}
        <div className="max-sm:flex max-sm:justify-start max-sm:items-center">
          <button
            onClick={handleDashboardClick}
            disabled={isPending}
            aria-label="Go to Dashboard"
            title="Dashboard"
            className="relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all
              bg-zinc-900/80 backdrop-blur-md shadow-md border border-zinc-700
              hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:border-blue-500
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LayoutGrid className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors" />
            )}
          </button>
        </div>

        {/* ✅ Center: Logo */}
        <div className="flex justify-center items-center">
          <Link
            href="/"
            className="flex bg-blue-500 p-3 rounded-full gap-2 items-center hover:opacity-90 transition-all"
          >
            <Icons.logo className="h-4 w-4" />
          </Link>
        </div>

        {/* ✅ Right: User or Sign In */}
        <div className="max-sm:flex max-sm:justify-end max-sm:items-center">
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <Link
              href="/login"
              className="text-zinc-300 max-sm:text-blue-500 text-sm font-bold underline underline-offset-4 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
