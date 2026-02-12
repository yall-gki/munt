"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { UserAvatar } from "@/components/UserAvatar";
import gsap from "gsap";
import { LogOut, Settings, User as UserIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface UserAccountMenuProps {
  user: Pick<User, "name" | "email" | "image">;
}

export default function UserAccountMenu({ user }: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && linksRef.current.length > 0) {
      gsap.fromTo(
        linksRef.current,
        { opacity: 0 },
        {
         
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.2,
        }
      );
    }
  }, [isOpen]);

  return (
    <div className="relative z-50">
      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-white hover:text-blue-400 transition-all group"
          aria-label="Toggle Menu"
        >
          <div className="space-y-1 transition-all duration-300">
            <div className="w-6 h-[2px] bg-white rounded" />
            <div className="w-6 h-[2px] bg-white rounded" />
          </div>
        </button>
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 bg-zinc-950/95 text-white flex flex-col items-center justify-between py-10 px-6 overflow-y-auto backdrop-blur-md border-b border-zinc-800 md:hidden"
          >
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              {/* Header */}
              <div className="flex items-center gap-3">
                <UserAvatar
                  user={{ name: user.name || null, image: user.image || null }}
                  className="h-10 w-10"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{user.name}</span>
                  <span className="text-sm text-zinc-400 max-w-[200px] truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition md:order-3"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Links */}
              <nav className="flex flex-col gap-8 md:gap-4 md:flex-row md:items-start md:justify-center md:text-sm md:font-semibold md:not-italic text-center text-4xl font-bold italic mt-10 md:mt-0">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/wallet", label: "Wallet" },
                  { href: "/account/settings", label: "Account" },
                ].map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    ref={(el) => (linksRef.current[i] = el)}
                    onClick={() => setIsOpen(false)}
                    className="hover:text-blue-500 transition-transform duration-300 hover:scale-105 md:hover:scale-100"
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  ref={(el) => (linksRef.current[3] = el)}
                  onClick={() => {
                    signOut({ callbackUrl: `${window.location.origin}/login` });
                    setIsOpen(false);
                  }}
                  className="text-red-500 hover:text-red-400 mt-4 md:mt-0 transition-transform duration-300 hover:scale-105 md:hover:scale-100"
                >
                  Sign Out
                </button>
              </nav>
            </div>

            {/* Footer */}
            <div className="text-sm text-zinc-600 mt-8 md:mt-0">
              &copy; {new Date().getFullYear()} Munt. All rights reserved.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop dropdown */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-1.5 text-sm text-zinc-200 hover:text-white transition">
              <UserAvatar
                user={{ name: user.name || null, image: user.image || null }}
                className="h-7 w-7"
              />
              <span className="max-w-[140px] truncate">
                {user.name || "Account"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-zinc-800 bg-zinc-950 text-white"
          >
            <div className="px-2 py-2">
              <p className="text-sm font-semibold">{user.name || "User"}</p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link href="/account/settings#profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onSelect={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
              className="text-rose-400 focus:text-rose-300"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
