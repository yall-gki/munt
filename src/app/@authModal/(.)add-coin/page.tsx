"use client";
import { FC } from "react";
import Oinli from "@/components/coinlizt";
import CloseModal from "@/components/CloseModal";

const page: FC = () => {
  return (
    <div className="fixed border-2 border-zinc-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-zinc-900 w-3/4 max-w-lg h-[50vh] rounded-3xl shadow-lg z-50 gap-4 flex flex-col items-center justify-center">
      <div className="w-full p-4 flex justify-between items-center">
        {" "}
        <h2 className="text-l font-semibold italic  text-white">Watchlist</h2>
        <div className="">
          <CloseModal />
        </div>
      </div>
      <div className="relative overflow-y-auto scrollbar-hide h-full w-full">
        <Oinli />
      </div>
    </div>
  );
};

export default page;
