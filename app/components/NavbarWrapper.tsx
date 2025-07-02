import { getNavigationSettings } from "@/lib/queries/navigation"
import Navbar from "./Navbar"

export default async function NavbarWrapper() {
  const data = await getNavigationSettings()
  
  return <Navbar data={data} />
}
