import { getAuthSession } from "@/lib/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await getAuthSession();
  return <NavbarClient session={session} />;
}
