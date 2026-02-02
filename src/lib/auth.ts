import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}