import SignIn from "../../../components/auth/SignIn";
import { buttonVariants } from "../../../components/ui/Button";
import { cn } from "../../../lib/utils";
import { ChevronLeft } from "lucide-react";

import { FC } from "react";

const page: FC = () => {
  return (
    <div className="absolute inset-0 flex item-center justify-center">
      <div className="h-auto max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
      

        <SignIn />
      </div>
    </div>
  );
};

export default page;
