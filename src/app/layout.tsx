import FavoriteCoins from "@/components/FavoriteCoins";
import NavbarWrapper from "@/components/NavbarWrapper";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Munt — Crypto Dashboard",
  description: "A crypto info website.",
  icons: {
    icon: "/favicon.ico",
  },
};

const inter = Inter({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  const navbar = await NavbarWrapper(); // ✅ PRE-resolve async component

  return (
    <html
      lang="en"
      className={cn(
        "bg-zinc-950 min-h-screen text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className="antialiased">
        <Providers>
          <SpeedInsights />
          <Analytics />
          {navbar} {/* ✅ Use resolved JSX */}
          <FavoriteCoins />
          {authModal}
          <main className="w-full bg-zinc-950 h-[calc(92vh-8rem)]">
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
