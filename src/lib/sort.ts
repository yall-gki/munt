export const sortedList = (
  list: any[] = [], // ✅ fallback if undefined
  order: string,
  sortOrder: "asc" | "desc"
) => {
  if (!Array.isArray(list)) return [];

  const sorted = [...list];

  switch (order) {
    case "price":
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.current_price - b.current_price
          : b.current_price - a.current_price
      );
      break;

    case "volume":
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.market_cap - b.market_cap
          : b.market_cap - a.market_cap
      );
      break;
    case "marketCap":
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.market_cap - b.market_cap
          : b.market_cap - a.market_cap
      );
      break;

    default:
      return sorted; // ✅ still return sorted (not original) if no match
  }

  return sorted;
};
