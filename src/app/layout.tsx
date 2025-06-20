import FavoriteCoins from "@/components/FavoriteCoins";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
export const metadata = {
  title: "Flow",
  description: "A Reddit clone built with Next.js and TypeScript.",
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
          <Navbar />
          <FavoriteCoins />
          {authModal}
          <main className="w-full bg-zinc-950  h-[calc(100vh-11rem)] max-md:h-auto ">{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
