import { ClerkProvider } from '@clerk/nextjs'
import { Montserrat } from "next/font/google"
import "../globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
})

export const metadata = {
  title: "Pieslēgšanās - Vestate",
  description: "Pieslēgšanās Vestate admin panelim",
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="lv" className={montserrat.className}>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
