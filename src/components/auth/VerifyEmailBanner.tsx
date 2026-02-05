"use client";

import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const VERIFY_TOAST_KEY = "verify-email-toast-shown";

export default function VerifyEmailBanner() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const hasShownToast = useRef(false);
  const [resending, setResending] = useState(false);

  const isUnverified =
    status === "authenticated" &&
    session?.user?.email &&
    session.user.emailVerified == null;

  useEffect(() => {
    if (!isUnverified || hasShownToast.current) return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(VERIFY_TOAST_KEY)) return;
      sessionStorage.setItem(VERIFY_TOAST_KEY, "1");
      hasShownToast.current = true;
      toast({
        title: "Verify your email",
        description: "Check your inbox for the verification code or link.",
      });
    } catch {
      hasShownToast.current = true;
      toast({
        title: "Verify your email",
        description: "Check your inbox for the verification code or link.",
      });
    }
  }, [isUnverified, toast]);

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post("/api/auth/resend-verification");
      toast({
        title: "Email sent",
        description: "Check your inbox for the verification link.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  if (!isUnverified) return null;

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 text-amber-200">
      <div className="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm flex-wrap">
        <span className="font-medium">Please verify your email.</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="underline underline-offset-2 hover:text-amber-100 disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend verification email"}
        </button>
      </div>
    </div>
  );
}
