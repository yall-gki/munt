"use client";
import { FC } from "react";
import Oinli from "@/components/coinlizt";

const page: FC = () => {
  return (
    <div className="fixed inset-0 bg-zinc-900/20 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg h-[80vh] rounded-lg overflow-y-auto shadow-lg relative">
        <Oinli />
      </div>
    </div>
  );
};

export default page;
