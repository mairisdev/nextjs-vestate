'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Kaut kas nogāja greizi!</h2>
        <p className="text-gray-600 mb-4">
          {error.digest === 'DYNAMIC_SERVER_USAGE' 
            ? 'Lapas ielādes problēma' 
            : 'Nezināma kļūda'}
        </p>
        <button
          onClick={reset}
          className="bg-[#00332D] text-white px-6 py-2 rounded"
        >
          Mēģināt vēlreiz
        </button>
      </div>
    </div>
  )
}