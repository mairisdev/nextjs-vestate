import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from "react";
import AdminSidebar from '../components/admin/AdminSidebar';
import { Montserrat } from "next/font/google";
import "../globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
})

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="lv" className={montserrat.className}>
        <body>
      <AdminSidebar>{children}</AdminSidebar>
        </body>
      </html>
    </ClerkProvider>
  );
}
