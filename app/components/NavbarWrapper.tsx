import { getNavigationSettings } from "@/lib/queries/navigation"
import Navbar from "./Navbar"

export default async function NavbarWrapper() {
  const data = await getNavigationSettings()

  // Make sure logoUrl is set to null if it's not available, instead of undefined
  const updatedData = {
    ...data,
    logoUrl: data?.logoUrl ?? null, // Use null instead of undefined
  }

  return <Navbar data={updatedData} />
}
