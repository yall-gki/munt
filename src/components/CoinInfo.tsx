import { cn } from "@/lib/utils";
import { Share, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import axios from "axios";

const CoinInfo: ({ data }: any) => any = ({ data }) => {
  const [color, setColor] = useState("text-slate-500");
  const [change24, setChange] = useState<number | any>();
  const addF = async (coinId: any) => {
    await axios
      .post("http://localhost:3000/api/coins/add-fav", { coinId })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  
  };
  console.log(data);

  function formatChange(change: number) {
    let currData = data?.price_change_percentage_24h;
    if (currData) {
      if (currData < 0.0) {
        setColor("text-red-500");
        change = currData.toFixed(2) * -1;
        setChange(change);
      } else if (currData > 0.0) {
        setColor("text-green-500");
        change = currData.toFixed(2);
        setChange(change);
      }
    } else {
      setChange(0.0);
    }
  }

  useEffect(() => {
    formatChange(data?.price_change_percentage_24h);
  }, [data]);
  return (
    <div className="min-h-[90vh] w-full flex flex-col items-start justify-start border border-r-slate-400 text-black gap-2 ">
      <div className="w-full h-7 flex items-center justify-between p-4 mt-3">
        <div className="flex items-center justify-center w-auto gap-2 cursor-pointer ">
          <img
            src={data?.image}
            alt=""
            className="h-6 w-6 rounded-2xl bg-[#EFF2F5 ] "
          />
          <h1 className="font-bold text-lg">{data?.name} </h1>
          <h1 className="font-semibold text-slate-500 ">
            {data?.symbol.toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2">
          {" "}
          <Star
            onClick={() => {
              addF(data.id);
              setColor("text-yellow-400");
            }}
            className={`h-8 w-8 p-2 ${color}   rounded-md bg-[#EFF2F5] cursor-pointer`}
          />
          <Share className="h-8 w-8 p-2 text-slate-500 rounded-md bg-[#EFF2F5] cursor-pointer  " />
        </div>
      </div>
      <div className="h-auto  p-4">
        <h1 className="text-4xl font-bold">
          {" "}
          ${data?.current_price.toLocaleString("en-US")}
        </h1>
        <h3
          className={cn(
            color,
            "font-bold text-sm flex items-center justify-start mt-2"
          )}
        >
          {change24 < 0.0 ? <Icons.chevyDown /> : <Icons.chevyUp />}
          {change24}% (1d)
        </h3>{" "}
      </div>

      {/* <h1 className="font-semibold ">Name : {data?.name} </h1>
      <h1 className="font-semibold ">Market Cap : {data?.market_cap} </h1>
      <h1 className="font-semibold ">Rank : {data?.market_cap_rank} </h1>
      <h1 className="font-semibold ">Volume : {data?.total_volume} </h1> */}
    </div>
  );
};

export default CoinInfo;
