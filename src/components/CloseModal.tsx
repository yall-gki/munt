"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Button } from "./ui/Button";

interface CloseModalProps {
  onClose?: () => void;
}

const CloseModal: FC<CloseModalProps> = ({ onClose }) => {
  const router = useRouter();
  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    router.back();
  };

  return (
    <Button
      type="button"
      variant="subtle"
      className="h-7 w-7 p-2 rounded-full"
      onClick={handleClose}
    >
      <X aria-label="close modal" className="h-4 w-4" strokeWidth={2.5} />
    </Button>
  );
};

export default CloseModal;
