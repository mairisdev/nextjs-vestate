import { getSoldProperties } from "@/lib/queries/soldProperties"
import ClientGallery from "./ClientGallery"

export default async function RecentSales() {
  const dbProperties = await getSoldProperties()

  const properties = dbProperties.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    size: p.size,
    type: p.series,
    floor: p.floor,
    description: p.description || "",
    link: p.link,
    status: p.status === "pārdots" ? "sold" : "active",
    images: p.imageUrls,
  }))

  return <ClientGallery properties={properties} />
}
