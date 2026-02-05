export const addToFavorites = async (req: any) => {
  const { coinId } = req;
  const response = await fetch("/api/coins/add-fav", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coinId }),
  });

  const data = await response.json();

  if (data.success) {
    return new Response("success", { status: 200 });
  } else {
    console.error("Failed to add to favorites");
  }
};
