import Navbar from "./Navbar";
import { getAuthSession } from "@/lib/auth";

export default async function NavbarWrapper() {
  const session = await getAuthSession();
  const navbar = await Navbar({ session });
  return navbar;
}
