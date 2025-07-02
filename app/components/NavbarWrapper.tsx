import { getNavigationSettings } from "@/lib/queries/navigation"
import Navbar from "./Navbar"

export default async function NavbarWrapper() {
  const data = await getNavigationSettings()

  // Ensure that logoAlt is always a string, use default value if it's undefined
  const updatedData = {
    ...data,
    logoUrl: data?.logoUrl ?? null, // Ensure null if logoUrl is missing
    logoAlt: data?.logoAlt || "Default logo", // Default value if logoAlt is undefined
  }

  return <Navbar data={updatedData} />
}
