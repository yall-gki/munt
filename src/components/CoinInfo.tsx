// CoinInfo.tsx
import { cn } from "@/lib/utils";
import { Share, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { useFavoriteCoinsStore } from "@/lib/store";

const CoinInfo = ({ data }: any) => {
  const { favorites, fetchFavorites, addFavorite } = useFavoriteCoinsStore();
  const [color, setColor] = useState("text-slate-500");
  const [change24, setChange] = useState<number>(0);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const isFavorite = favorites.includes(data?.id);

  const toggleFavorite = async () => {
    const newFavorites = isFavorite
      ? favorites.filter((coin) => coin !== data?.id)
      : [...favorites, data?.id];
    useFavoriteCoinsStore.setState({ favorites: newFavorites });
    await addFavorite(data?.id);
    fetchFavorites();
  };

  useEffect(() => {
    if (data?.price_change_percentage_24h !== undefined) {
      let curr = data.price_change_percentage_24h;
      setColor(curr < 0 ? "text-red-500" : "text-green-500");
      setChange(Number(Math.abs(curr).toFixed(2)));
    }
  }, [data]);

  return (
    <div className="w-full bg-zinc-900 p-4 rounded-md text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img
            src={data?.image}
            alt={data?.name}
            className="h-6 w-6 rounded-full bg-[#EFF2F5]"
          />
          <h1 className="text-lg font-bold">{data?.name}</h1>
          <h2 className="text-slate-500 font-semibold">
            {data?.symbol?.toUpperCase()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Star
            fill={isFavorite ? "gold" : "none"}
            onClick={toggleFavorite}
            className={`h-8 w-8 p-2 rounded-md ${
              isFavorite ? "text-[#ffd700]" : "text-slate-500"
            } cursor-pointer`}
          />
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
  );
};

export default CoinInfo;
