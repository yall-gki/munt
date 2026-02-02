"use client";
import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";
import { LucideDisc } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "@/lib/validators/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "signin" | "signup";
}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, mode = "signin", ...props }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isSignUp = mode === "signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput | SignUpInput>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider);
    } catch (err) {
      toast({
        title: "There was a problem",
        description: `There was an error logging in with ${provider}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const onSubmitEmail = async (data: SignInInput | SignUpInput) => {
    setIsLoading("email");
    try {
      if (isSignUp) {
        const signUpData = data as SignUpInput;
        await axios.post("/api/auth/register", signUpData);
        // Auto sign-in so user can skip verification
        const result = await signIn("credentials", {
          email: signUpData.email,
          password: signUpData.password,
          redirect: false,
        });
        if (result?.error) {
          toast({
            title: "Account created",
            description: "Please sign in with your email and password.",
          });
          setShowEmailForm(false);
          return;
        }
        toast({
          title: "Please verify your email",
          description: "Check your inbox for the verification link. You can use the app in the meantime.",
        });
        router.push("/");
        router.refresh();
      } else {
        const signInData = data as SignInInput;
        const result = await signIn("credentials", {
          email: signInData.email,
          password: signInData.password,
          redirect: false,
        });

        if (result?.error) {
          toast({
            title: "Error",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${isSignUp ? "sign up" : "sign in"}`,
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
          <div className="flex flex-col gap-2">
            <Button
              isLoading={isLoading === "google"}
              disabled={!!isLoading}
              onClick={() => handleOAuthLogin("google")}
              size="sm"
              className="w-full"
            >
              {isLoading === "google" ? null : (
                <Icons.google className="h-4 w-4 mr-2" />
              )}
              Google
            </Button>

            <Button
              isLoading={isLoading === "discord"}
              disabled={!!isLoading}
              onClick={() => handleOAuthLogin("discord")}
              size="sm"
              className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
            >
              {isLoading === "discord" ? null : (
                <LucideDisc className="h-4 w-4 mr-2" />
              )}
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
            disabled={!!isLoading}
          >
            {isSignUp ? "Sign up with Email" : "Sign in with Email"}
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
          <div className="space-y-2">
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              disabled={!!isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              disabled={!!isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {isSignUp && (
            <>
              <div className="space-y-2">
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="Name (optional)"
                  disabled={!!isLoading}
                />
                {"name" in errors && errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register("username")}
                  type="text"
                  placeholder="Username (optional)"
                  disabled={!!isLoading}
                />
                {"username" in errors && errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>
            </>
          )}

          {!isSignUp && (
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowEmailForm(false)}
              disabled={!!isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              isLoading={isLoading === "email"}
              disabled={!!isLoading}
              size="sm"
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
