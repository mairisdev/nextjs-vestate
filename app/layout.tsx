import './globals.css'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata = {
  title: 'Vestate',
  description: 'Nekustamo īpašumu pārdošana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv" className={montserrat.className}>
      <body>{children}</body>
    </html>
  )
}
