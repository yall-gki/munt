import Link from "next/link";
import { Icons } from "./Icons";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { LayoutDashboard, LayoutGrid } from "lucide-react";

const Navbar: any = async () => {
  const session = await getAuthSession();

  return (
    <div className="inset-x-0 flex justify-center items-center bg-zinc-950 z-[10] h-[8vh] px-11 max-sm:px-4">
      <div className="w-full h-full mx-auto flex items-center justify-between max-sm:grid max-sm:grid-cols-3">
        {/* Left: Dashboard link */}
        <div className="max-sm:flex max-sm:justify-start max-sm:items-center">
          <Link href="/dashboard" className="block">
            <div className="bg-white rounded-full p-2 hover:opacity-90 transition-all">
              <LayoutGrid className="w-5 h-5 text-black" />
            </div>
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center items-center">
          <Link
            href="/"
            className="flex bg-blue-500 p-3 rounded-full gap-2 items-center"
          >
            <Icons.logo className="h-4 w-4" />
          </Link>
        </div>

        {/* Right: Auth */}
        <div className="max-sm:flex max-sm:justify-end max-sm:items-center">
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <Link
              href="/sign-in"
              className="text-zinc-300 max-sm:text-blue-500 text-sm font-bold underline underline-offset-4"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
