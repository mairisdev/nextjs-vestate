import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { v4 as uuid } from "uuid"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, code } = await req.json()

  const access = await prisma.accessRequest.findFirst({
    where: { email, code },
  })

  if (!access || new Date() > access.expiresAt) {
    return NextResponse.json({ error: "Nepareizs vai beidzies kods" }, { status: 400 })
  }

  await prisma.accessRequest.delete({
    where: { id: access.id },
  })

  const token = uuid()
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 // 24h

  ;(await cookies()).set("vestate_access_token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  ;(await cookies()).set("vestate_access_expiry", expiresAt.toString(), {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return NextResponse.json({ ok: true, valid_for: expiresAt })
}
