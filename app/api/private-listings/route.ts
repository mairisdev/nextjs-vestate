import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const listings = [
  {
    title: "3 istabu dzīvoklis Jūrmalā",
    price: "Pēc vienošanās",
    description: "2 stāvu dzīvoklis",
    size: "98m2",
    extra: "Info2",
    image: "/private-offers/Jurmala1.webp",
  },
]

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("vestate_access_token")
  const expiry = cookieStore.get("vestate_access_expiry")

  if (!token || !expiry) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const expiresAt = Number(expiry.value)
  if (Date.now() > expiresAt) {
    cookieStore.delete("vestate_access_token")
    cookieStore.delete("vestate_access_expiry")
    return NextResponse.json({ error: "Expired" }, { status: 401 })
  }

  return NextResponse.json({ listings, validUntil: new Date(expiresAt).toISOString() })
}
