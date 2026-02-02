import Link from "next/link";
import { Icons } from "./Icons";
import UserAuthForm from "./UserAuthForm";

const SignIn = () => (
  <div className="container flex flex-col justify-center items-center  w-full mx-auto sm:w-[400px]  space-y-6">
    <div className="flex flex-col space-y-2 text-center">
      <Icons.logo className="mx-auto h-6 w-6" />
      <h1 className="text-2xl font-semibold tracking-tight">Welcome Back!</h1>
      <p className="text-sm max-w-xs mx-auto font-medium">
        By continuing you are setting an account and agree to our privacy
        policy
      </p>
      <UserAuthForm mode="signin" />
      <p className="px-8 text-center text-sm text-zinc-700">
        New to Flow?
        <Link
          href="sign-up"
          className=" hover:text-zinc-800 text-sm underline underline-offset-4"
        >
          {"  "}
          Sign Up
        </Link>
      </p>
    </div>
  </div>
);

export default SignIn;
