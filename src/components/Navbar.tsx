import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/Button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { ChevronDown } from "lucide-react";
import NewsDropDown from "./NewsDropDown";
const Navbar: any = async () => {
  const session = await getAuthSession();

  return (
    <div className="  inset-x-0 h-[3rem] flex justify-center items-center    z-[10] py-2 mx-8">
      <div className=" w-full h-full mx-auto flex items-center justify-between ">
        {/* logo */}
        <Link href="/" className="flex h-fit gap-2 items-center">
          <Icons.logo className=" h-9 w-9 sm:h-7 sm:w-7  " />
        </Link>
        <ul className="flex items-center justify-between list-none gap-16">
          <li className="font-semibold text-sm cursor-pointer w-auto ">
            <a href="/dashboard"> Dashboard</a>
          </li>
         
        </ul>
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link
            href="/sign-in"
            className=" hover:text-zinc-800 text-sm font-bold underline underline-offset-6"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
