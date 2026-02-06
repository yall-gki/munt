"use client"
import React from "react";
import { FC } from "react";
import CloseModal from "@/components/CloseModal";
import SignIn from "@/components/auth/SignIn";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";



const Page: FC = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        router.back(); // close the modal (or navigate away)
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-zinc-900/20 z-50">
      <div className="container flex items-center  h-full max-w-lg max-sm:max-w-sm mx-auto px-4">
        <div
          ref={modalRef}
          className="relative bg-white w-full h-fit py-20 px-4 max-sm:px-3 max-sm:py-12 rounded-lg"
        >
          <div className="absolute top-4 right-4">
            <CloseModal />
          </div>
           <SignIn /> 
        </div>
      </div>
    </div>
  );
};

export default Page;
