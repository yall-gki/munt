import FavoriteCoins from "@/components/FavoriteCoins";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
export const metadata = {
  title: "Flow",
  description: "A crypto info website.",
};
const inter = Inter({
  subsets: ["latin"],
});
export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-zinc-950 min-h-screen text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className=" antialiased">
        <Providers>
          <SpeedInsights />
          <Navbar />
          <FavoriteCoins />
          {authModal}
          <main className="w-full bg-zinc-950   h-[calc(92vh-8rem)]  ">
            {children}{" "}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
