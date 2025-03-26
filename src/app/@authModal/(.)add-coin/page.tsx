"use client";
import React from "react";
import { FC } from "react";
import CloseModal from "@/components/CloseModal";
import SignIn from "@/components/SignIn";
import Oinli from "@/components/coinlizt";

const page: FC = () => {
  return (
    <div className="fixed inset-0 bg-zinc-900/20 z-10">
      <div className=" relative flex items-center h-full max-w-lg mx-auto">
        <div className=" bg-white w-full h-2/3  rounded-lg overflow-scroll">
        
          <Oinli />
        </div>
      </div>
    </div>
  );
};

export default page;
