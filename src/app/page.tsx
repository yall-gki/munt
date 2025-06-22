"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* ✅ Background Image always visible */}
      

      {/* ✅ Optional dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* ✅ Centered Content, now visible on all screens */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 px-4"></div>
    </div>
  );
}
