"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useFavoriteCoinsStore } from "@/lib/store";
import LiveTicker from "@/components/Ticker";

// Inside return()


export default function Home() {


  return (
    <div className="relative w-full h-full overflow-hidden bg-black text-white">
      {/* ✅ Background Image */}
    

      {/* ✅ Dark Overlay */}
      <div className="absolute inset-0 z-10 max-h-full" />

      {/* ✅ Hero Section */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-[70vh] px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold mb-4"
        >
          Welcome to <span className="text-blue-500">Munt</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg sm:text-xl text-zinc-300 max-w-xl mb-8"
        >
          Your all-in-one crypto dashboard — track your assets, monitor price
          trends, and get deep portfolio analysis with precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full transition-all shadow-lg">
              🚀 Go to Dashboard
            </button>
          </Link>
        </motion.div>
      </div>

      {/* ✅ Ticker */}
      <div className=" z-20 w-full absolute bottom-0 overflow-hidden">
        <LiveTicker />
      </div>
    </div>
  );
  
}
