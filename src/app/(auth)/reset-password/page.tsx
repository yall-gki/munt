"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Icons } from "@/components/Icons";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (token) setValue("token", token);
    if (email) setValue("email", email);
  }, [token, email, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token || !email) {
      toast({
        title: "Error",
        description: "Invalid reset link",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        ...data,
        token,
        email,
      });
      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Password reset successfully. You can now sign in.",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="absolute inset-0">
        <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "self-start -mt-20"
            )}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>

          <div className="container flex flex-col justify-center items-center w-full mx-auto sm:w-[400px] space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <Icons.logo className="mx-auto h-6 w-6" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Invalid Reset Link
              </h1>
              <p className="text-sm max-w-xs mx-auto font-medium text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
              <Link
                href="/forgot-password"
                className={cn(buttonVariants({ variant: "default" }), "mt-4")}
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start -mt-20"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="container flex flex-col justify-center items-center w-full mx-auto sm:w-[400px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.logo className="mx-auto h-6 w-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm max-w-xs mx-auto font-medium text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          {isSuccess ? (
            <div className="w-full space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Password reset successfully! Redirecting to sign in...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="space-y-2">
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="New Password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
