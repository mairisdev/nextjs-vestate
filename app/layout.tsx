import "./globals.css"
import { Montserrat } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
})

export const metadata = {
  title: "Vestate",
  description: "Nekustamo īpašumu pārdošana",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
