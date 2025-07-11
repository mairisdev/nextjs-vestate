import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Šī īpašumu kategorija nav atrasta.</p>
        <Link 
          href="/"
          className="bg-[#00332D] text-white px-6 py-3 rounded-md hover:bg-[#004940] transition-colors"
        >
          Atgriezties sākumlapā
        </Link>
      </div>
    </div>
  )
}
