"use client";
import { FC } from "react";
import Oinli from "@/components/coinlizt";
import CloseModal from "@/components/CloseModal";

const page: FC = () => {
  return (
    <div className="fixed inset-0  bg-zinc-900/20 z-50 flex items-center justify-center">
      <div className="overflow-y-auto scrollbar-hide p-4 bg-zinc-900 py-4 w-3/4 max-w-lg h-[50vh] rounded-3xl  shadow-lg relative">
        <div className="absolute top-5 right-6">
          <CloseModal />
        </div>

        <h2 className="text-xl font-semibold pl-6 text-white">Add a Coin</h2>
        <Oinli />
      </div>
    </div>
  );
};

export default page;
