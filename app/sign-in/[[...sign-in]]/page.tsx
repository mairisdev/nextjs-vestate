import { SignIn, ClerkProvider } from '@clerk/nextjs'
import '../../globals.css'

export default function Page() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="lv">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Pieslēgties admin panelim
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Vestate CMS pieslēgšanās
                </p>
              </div>
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-[#00332D] hover:bg-[#00332D]/90',
                    card: 'shadow-lg',
                  }
                }}
              />
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
