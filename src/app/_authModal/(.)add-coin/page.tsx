"use client";
import { FC } from "react";
import { motion } from "framer-motion";
import Oinli from "@/components/coinlizt";
import CloseModal from "@/components/CloseModal";

const page: FC = () => {
  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="w-[90%] max-w-lg h-[50vh] rounded-2xl p-4 shadow-lg
        border border-white/10 bg-zinc-900/80 backdrop-blur
        flex flex-col gap-4"
      >
        <div className="w-full p-2 px-4 flex justify-between items-center">
          <h2 className="text-base font-semibold italic text-white">
            Watchlist
          </h2>
          <CloseModal />
        </div>

        <div className="relative overflow-y-auto h-full w-full custom-scroll">
          <Oinli />
        </div>
      </motion.div>
    </div>
  );
};

export default page;
