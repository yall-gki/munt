"use client";
import { FC } from "react";
import { motion } from "framer-motion";
import Oinli from "@/components/coinlizt";
import CloseModal from "@/components/CloseModal";

const page: FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.4,
        }}
        className="border-2 border-zinc-100 p-4 bg-zinc-900 w-3/4 max-w-lg h-[50vh] rounded-3xl shadow-lg flex flex-col gap-4"
      >
        <div className="w-full p-4 flex justify-between items-center">
          <h2 className="text-l font-semibold italic text-white">Watchlist</h2>
          <CloseModal />
        </div>
        <div className="relative overflow-y-auto scrollbar-hide h-full w-full">
          <Oinli />
        </div>
      </motion.div>
    </div>
  );
};

export default page;
