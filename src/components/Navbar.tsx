// components/Navbar.tsx
import { getAuthSession } from "@/lib/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar(p0: unknown) {
  const session = await getAuthSession();
  return <NavbarClient session={session} />;
}
