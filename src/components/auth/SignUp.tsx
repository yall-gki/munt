import Link from "next/link";
import { Icons } from "../Icons";
import UserAuthForm from "./UserAuthForm";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/Button";

const SignUp = () => (
  <div className="container flex justify-center items-center w-full mx-auto">
    <div className="relative w-full sm:w-[400px] rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 shadow-lg">
      
      {/* Back to Home */}
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-3 top-3 text-zinc-400 hover:text-white"
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Home
      </Link>

      <div className="flex flex-col space-y-2 text-center pt-6">
        <Icons.logo className="mx-auto h-6 w-6 text-white" />

        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Sign Up
        </h1>

        <p className="text-xs text-zinc-400 max-w-xs mx-auto font-medium">
          By continuing you are creating an account and agree to our privacy
          policy
        </p>
      </div>

      <UserAuthForm mode="signup" />

      <p className="text-center text-sm text-zinc-400">
        Already a Flow user?
        <Link
          href="/login"
          className="ml-1 text-blue-500 hover:underline underline-offset-4"
        >
          Sign In
        </Link>
      </p>
    </div>
  </div>
);

export default SignUp;
