"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Icons } from "@/components/Icons";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid verification link");
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post("/api/auth/verify-email", { token, email });
        setIsSuccess(true);
        toast({
          title: "Success",
          description: "Email verified successfully!",
        });
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to verify email");
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to verify email",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, email, router, toast]);

  return (
    <div className="absolute inset-0">
      <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/sign-in"
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
              Verify Email
            </h1>
          </div>

          {isLoading ? (
            <div className="w-full text-center">
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          ) : isSuccess ? (
            <div className="w-full space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Email verified successfully! Redirecting to sign in...
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error || "Failed to verify email"}
                </p>
              </div>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
