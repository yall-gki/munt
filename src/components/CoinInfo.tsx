import { cn } from "@/lib/utils";
import { Share, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import axios from "axios";

const CoinInfo = ({ data }: any) => {
  const [fav, setFav] = useState<string[]>([]);
  const [color, setColor] = useState("text-slate-500");
  const [favcolor, setFavColor] = useState(false);
  const [change24, setChange] = useState<number>(0);

  // Function to add coin to favorites
  const addF = async (coinId: string) => {
    try {
      await axios.post("http://localhost:3000/api/coins/add-fav", { coinId });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    await addF(data?.id);
    setFavColor((prev) => !prev);
  };

  // Function to fetch favorite coins for the current user
  const getFav = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/user-coin");
      setFav(response.data || []);
    } catch (error) {
      console.error("Error fetching favorite coins:", error);
    }
  };

  // Update favorite color when fav list changes
  useEffect(() => {
    setFavColor(fav.some((coin: any) => coin.coinId === data.id));
  }, [fav, data.id]);

  // Fetch user's favorite coins on mount
  useEffect(() => {
    getFav();
  }, []);

  // Format price change percentage
  useEffect(() => {
    if (data?.price_change_percentage_24h !== undefined) {
      let currData = data.price_change_percentage_24h;
      setColor(currData < 0 ? "text-red-500" : "text-green-500");
      setChange(Number(Math.abs(currData).toFixed(2)));
    }
  }, [data]);

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-start justify-start border border-r-slate-400 text-black gap-2">
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
            fill={favcolor ? "gold" : "none"}
            onClick={toggleFavorite}
            className={`h-8 w-8 p-2 rounded-md ${
              favcolor ? "text-[#ffd700]" : "text-slate-500"
            } cursor-pointer`}
          />
          <Share className="h-8 w-8 p-2 text-slate-500 rounded-md bg-[#EFF2F5] cursor-pointer" />
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
  );
};

export default CoinInfo;
