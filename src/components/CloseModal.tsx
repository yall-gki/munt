"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Button } from "./ui/Button";

interface CloseModalProps {}

const CloseModal: FC<CloseModalProps> = ({}) => {
  const router = useRouter();

  return (
    <Button
      variant="subtle"
      className="h-7 w-7 p-2 rounded-full"
      onClick={() => router.back()}
    >
      <X aria-label="close modal" className="h-4 w-4" strokeWidth={2.5} />
    </Button>
  );
};

export default CloseModal;
