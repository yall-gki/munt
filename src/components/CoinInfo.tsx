import { cn } from "@/lib/utils";
import { Share, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { useFavoriteCoinsStore } from "@/lib/store";

const CoinInfo = ({ data }: any) => {
  const { favorites, fetchFavorites, addFavorite } = useFavoriteCoinsStore();
  const [color, setColor] = useState("text-slate-500");
  const [change24, setChange] = useState<number>(0);

  // Fetch user's favorite coins on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Check if this coin is in favorites
  const isFavorite = favorites.includes(data?.id);

  // Toggle favorite and update state instantly
  const toggleFavorite = async () => {
    const newFavorites = isFavorite
      ? favorites.filter((coin) => coin !== data?.id) // Remove from list
      : [...favorites, data?.id]; // Add to list

    useFavoriteCoinsStore.setState({ favorites: newFavorites }); // Optimistic UI update

    await addFavorite(data?.id);
    fetchFavorites(); // Sync with API to ensure correctness
  };

  // Format price change percentage
  useEffect(() => {
    if (data?.price_change_percentage_24h !== undefined) {
      let currData = data.price_change_percentage_24h;
      setColor(currData < 0 ? "text-red-500" : "text-green-500");
      setChange(Number(Math.abs(currData).toFixed(2)));
    }
  }, [data]);

  return (
    <div className="h-full max-md:h-44 w-full flex p-2 pr-0  flex-col items-start justify-start flex-1  text-neutral-100 gap-2">
      <div className="wrapper  h-full w-full  rounded-md bg-zinc-900 ">
        <div className="w-full h-7 flex items-center justify-between p-4 mt-3">
          <div className="flex items-center justify-center w-auto gap-2 cursor-pointer">
            <img
              src={data?.image}
              alt={data?.name}
              className="h-6 w-6 rounded-2xl bg-[#EFF2F5]"
            />
            <h1 className="font-bold text-lg">{data?.name}</h1>
            <h1 className="font-semibold text-slate-500">
              {data?.symbol.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2">
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
        <div className="h-auto p-4">
          <h1 className="text-4xl font-bold">
            ${data?.current_price.toLocaleString("en-US")}
          </h1>
          <h3 className={cn(color, "font-bold text-sm flex items-center mt-2")}>
            {change24 < 0.0 ? <Icons.chevyDown /> : <Icons.chevyUp />}
            {change24}% (1d)
          </h3>
        </div>
      </div>
    </div>
  );
};

export default CoinInfo;
