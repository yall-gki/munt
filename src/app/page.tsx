"use client"
import Image from "next/image";

export default function Home() {
  return (
    
      <div className="relative h-full max-sm:bg-zinc-950 w-full overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Hero"
          fill
          className="absolute top-0 left-0 w-full h-full object-cover select-none"
        />

        {/* New Radial Glow Overlay */}
        <span className="absolute max-sm:hidden inset-0 bg-[radial-gradient(circle_at_50%_80%,_#00ff99_10%,_rgba(0,0,0,0.8)_60%)] opacity-80"></span>

        {/* Centered Content */}
        <div className="absolute top-1/2 max-sm:hidden left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-white text-4xl font-bold"></h1>
          <p className="text-white mt-2 text-lg">
         
          </p>
        </div>
      </div>
    
  );
}
