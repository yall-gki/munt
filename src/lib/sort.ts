export const sortedList = (
  list: any[],
  order: string,
  sortOrder: "asc" | "desc"
) => {
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

    default:
      return list;
  }

  return sorted;
};
