import { getNavigationSettings } from "@/lib/queries/navigation"
import Navbar from "./Navbar"

export default async function NavbarWrapper() {
  const data = await getNavigationSettings()

  // Pārliecinieties, ka logoUrl tiek aizvietots ar undefined, ja tas ir null
  const updatedData = {
    ...data,
    logoUrl: data?.logoUrl ?? undefined, // Ja logoUrl ir null, aizvietojiet ar undefined
  }

  return <Navbar data={updatedData} />
}
