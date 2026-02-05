import { cn } from "@/lib/utils";
import { Share, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { useFavoriteCoinsStore } from "@/lib/store";
import Image from "next/image";
import { TradingInput } from "@/components/Widget";


type CoinInfoData = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h?: number | null;
};

const CoinInfo = ({
  data,
  onTradeComplete,
}: {
  data: CoinInfoData;
  onTradeComplete?: () => void;
}) => {
  const { favorites, fetchFavorites, toggleFavorite } = useFavoriteCoinsStore();
  const [color, setColor] = useState("text-slate-500");
  const [change24, setChange] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = favorites.includes(data?.id);

  const handleToggleFavorite = async () => {
    setLoading(true);
    await toggleFavorite(data?.id);
    setLoading(false);
  };

  useEffect(() => {
    const curr = data?.price_change_percentage_24h;
    if (typeof curr === "number") {
      setColor(curr < 0 ? "text-red-500" : "text-blue-400");
      setChange(Number(Math.abs(curr).toFixed(2)));
    }
  }, [data]);

  return (
    <>
      {" "}
      <div className="w-full bg-zinc-900 p-4 rounded-md text-white">
        <div className="flex justify-between items-center mb-4">
          {/* Coin Identity */}
          <div className="flex items-center gap-2">
            <Image
              src={data?.image}
              alt={data?.name}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full bg-[#EFF2F5]"
            />
            <h1 className="text-lg font-bold">{data?.name}</h1>
            <h2 className="text-slate-500 font-semibold">
              {data?.symbol?.toUpperCase()}
            </h2>
          </div>

          {/* Favorite + Share */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-8 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
            ) : (
              <Star
                onClick={handleToggleFavorite}
                className={cn(
                  "h-8 w-8 p-2 rounded-md cursor-pointer transition-colors",
                  isFavorite ? "text-blue-500" : "text-slate-500"
                )}
                fill={isFavorite ? "#3b82f6" : "none"} // Tailwind's blue-500 hex
              />
            )}
            <Share className="h-8 w-8 p-2 text-slate-500 rounded-md bg-zinc-800 cursor-pointer" />
          </div>
        </div>

        <h1 className="text-4xl font-bold">
          ${data?.current_price.toLocaleString("en-US")}
        </h1>
        <h3 className={cn(color, "font-bold text-sm mt-2 flex items-center")}>
          {change24 < 0 ? <Icons.chevyDown /> : <Icons.chevyUp />} {change24}%
          (1d)
        </h3>
      </div>
      <TradingInput onTradeComplete={onTradeComplete} contextCoinId={data?.id} />
    </>
  );
};

export default CoinInfo;
