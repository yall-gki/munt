import Navbar from "./Navbar";
import { getAuthSession } from "@/lib/auth";

export default async function NavbarWrapper() {
  const session = await getAuthSession();
  return <Navbar session={session} />;
}
