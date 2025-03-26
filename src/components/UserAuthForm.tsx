"use client";
import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { Button } from "./ui/Button";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";
import { LucideDisc } from "lucide-react";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (provider: string) => {
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

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Button
        isLoading={isLoading === "google"}
        disabled={!!isLoading}
        onClick={() => handleLogin("google")}
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
        onClick={() => handleLogin("discord")}
        size="sm"
        className="w-full bg-[#5865F2] hover:bg-[#4752C4]" // Discord Blue
      >
        {isLoading === "discord" ? null : (
          <LucideDisc className="h-4 w-4 mr-2" />
        )}
        Discord
      </Button>
    </div>
  );
};

export default UserAuthForm;
