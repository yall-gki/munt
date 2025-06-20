import Link from "next/link";
import { Icons } from "./Icons";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";

const Navbar: any = async () => {
  const session = await getAuthSession();

  return (
    <div className="inset-x-0 flex justify-center items-center border-b-2 border-[#48bb78] bg-zinc-950 z-[10] py-4 px-11 max-sm:px-4 max-sm:py-3">
      <div className="w-full h-full mx-auto flex items-center justify-between max-sm:grid max-sm:grid-cols-3">
        {/* Left: Dashboard link */}
        <div className="max-sm:flex max-sm:justify-start max-sm:items-center">
          <Link
            href="/dashboard"
            className="font-semibold text-[#48bb78]   text-sm cursor-pointer rounded-md"
          >
            Dashboard
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
              className="hover:text-zinc-300 text-sm font-bold underline underline-offset-4"
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
