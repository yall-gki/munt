import Link from "next/link";
import { Icons } from "./Icons";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { LayoutDashboard } from "lucide-react";

const Navbar: any = async () => {
  const session = await getAuthSession();

  return (
    <div className="inset-x-0 flex justify-center items-center border-b-2 border-blue-500 bg-zinc-950 z-[10] h-[6vh] px-11 max-sm:px-4 ">
      <div className="w-full h-full mx-auto flex items-center justify-between max-sm:grid max-sm:grid-cols-3">
        {/* Left: Dashboard link */}
        <div className="max-sm:flex max-sm:justify-start max-sm:items-center">
          <Link
            href="/dashboard"
            className="font-semibold  text-blue-500   text-sm cursor-pointer "
          >
            <LayoutDashboard className=" " />
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center items-center">
          <Link href="/" className="flex h-fit gap-2 items-center">
            <Icons.logo className="h-9 w-9 sm:h-7 sm:w-7" />
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
