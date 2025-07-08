"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { UserAvatar } from "@/components/UserAvatar";
import gsap from "gsap";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-white hover:text-blue-400 transition-all group"
        aria-label="Toggle Menu"
      >
        {/* Two-bar hamburger (long sticks) */}
        <div className="space-y-1 transition-all duration-300">
          <div className="w-6 h-[2px] bg-white rounded" />
          <div className="w-6 h-[2px] bg-white rounded" />
        </div>
      </button>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="fixed inset-0 bg-zinc-950 text-white flex flex-col items-center justify-between py-10 px-6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center w-full">
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
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-10 mt-20 text-center text-4xl font-bold italic">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/wallet", label: "Wallet" },
                { href: "/account", label: "Account" },
              ].map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => (linksRef.current[i] = el)}
                  onClick={() => setIsOpen(false)}
                  className="hover:text-blue-500 transition-transform duration-300 hover:scale-105"
                >
                  {link.label}
                </Link>
              ))}

              <button
                ref={(el) => (linksRef.current[3] = el)}
                onClick={() => {
                  signOut({ callbackUrl: `${window.location.origin}/sign-in` });
                  setIsOpen(false);
                }}
                className="text-red-500 hover:text-red-400 mt-4 transition-transform duration-300 hover:scale-105"
              >
                Sign Out
              </button>
            </nav>

            {/* Footer */}
            <div className="text-sm text-zinc-600 mt-24">
              &copy; {new Date().getFullYear()} Munt. All rights reserved.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
