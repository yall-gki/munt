import Link from "next/link";
import { Icons } from "./Icons";
import UserAuthForm from "./UserAuthForm";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { FC } from "react";
import MiniCoin from "./minicoin";
import CloseModal from "./CloseModal";


const Oinli = () => {
  const { data: cacheD, isLoading, isError } = useCoinsData(ids);
console.log(cacheD);

  return (
    <div className="relative w-full p-4 pt-6 flex flex-col justify-center items-center      ">
      <div className="absolute  top-2 right-2 ">
        <CloseModal />
      </div>
      <div className="flex w-full flex-col text-center">
        {cacheD?.map((coin: any) => {
          return (
            <MiniCoin
              key={coin.symbol}
              name={coin.name}
              price={coin.current_price}
              image={coin.image}
              symbol={coin.symbol}
            />
          );
        })}
      </div>
    </div>
  );
};

   


export default Oinli;
