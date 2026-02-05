"use client";

import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { signIn, getSession } from "next-auth/react";
import { Icons } from "../Icons";
import { useToast } from "@/hooks/use-toast";
import { LucideDisc } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validators/auth";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "signin" | "signup";
  /** IMPORTANT: pass modal close handler */
  onSuccess?: () => void;
}

const UserAuthForm: FC<UserAuthFormProps> = ({
  className,
  mode = "signin",
  onSuccess,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(mode === "signup");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSignUp = mode === "signup";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput | SignUpInput>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  /* ---------------- OAuth ---------------- */
  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast({
        title: "Login failed",
        description: `Could not sign in with ${provider}`,
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  const onSubmitEmail = async (data: SignInInput | SignUpInput) => {
    setIsLoading("email");
  
    try {
      /* -------- SIGN UP -------- */
      if (isSignUp) {
        const signUpData = data as SignUpInput;
  
        await axios.post("/api/auth/register", signUpData);
  
        toast({
          title: "Verify your email",
          description: "We sent you a verification code.",
        });
  
        router.push(
          `/verify-email?email=${encodeURIComponent(signUpData.email)}`
        );
        return;
      }
  
      /* -------- SIGN IN -------- */
      const signInData = data as SignInInput;
  
      const result = await signIn("credentials", {
        email: signInData.email,
        password: signInData.password,
        redirect: false,
      });
  
      if (result?.error) {
        // CredentialsSignin covers:
        // - wrong password
        // - email not verified
        toast({
          title: "Sign in failed",
          description: "Invalid credentials or email not verified.",
          variant: "destructive",
        });
        return;
      }

      // ✅ success
      await getSession();
      toast({ title: "Welcome back 👋" });
  
      // close modal if provided
      onSuccess?.();
  
      // ONE navigation only
      router.replace(callbackUrl);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description:
          error.response?.data?.error ??
          `Failed to ${isSignUp ? "sign up" : "sign in"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };
  

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      {!showEmailForm ? (
        <>
          {/* OAuth */}
          <div className="flex flex-col gap-2">
            <Button
              isLoading={isLoading === "google"}
              disabled={!!isLoading}
              onClick={() => handleOAuthLogin("google")}
              size="sm"
              className="w-full"
            >
              <Icons.google className="h-4 w-4 mr-2" />
              Google
            </Button>

            <Button
              isLoading={isLoading === "discord"}
              disabled={!!isLoading}
              onClick={() => handleOAuthLogin("discord")}
              size="sm"
              className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
            >
              <LucideDisc className="h-4 w-4 mr-2" />
              Discord
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={() => setShowEmailForm(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isSignUp ? "Sign up with Email" : "Sign in with Email"}
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            disabled={!!isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}

          <Input
            {...register("password")}
            type="password"
            placeholder="Password"
            disabled={!!isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          {isSignUp && (
            <>
              <Input
                {...register("name")}
                placeholder="Name (optional)"
                disabled={!!isLoading}
              />
              <Input
                {...register("username")}
                placeholder="Username (optional)"
                disabled={!!isLoading}
              />
            </>
          )}

          {!isSignUp && (
            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline text-right block"
            >
              Forgot password?
            </Link>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowEmailForm(false)}
            >
              Back
            </Button>
            <Button
              type="submit"
              isLoading={isLoading === "email"}
              className="flex-1"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserAuthForm;
