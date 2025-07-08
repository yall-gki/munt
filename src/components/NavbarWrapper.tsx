import { getAuthSession } from "@/lib/auth";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const session = await getAuthSession();
  return <Navbar session={session} />;
}
