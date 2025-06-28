"use client"

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#00332D] mb-4">Pārskats</h2>
      <p className="text-gray-700 text-sm mb-6">
        Laipni lūdzam admina panelī. Šeit vari pārvaldīt mājaslapas saturu.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-1">Nepabeigtie pieprasījumi</h3>
          <p className="text-2xl font-semibold text-[#00332D]">—</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-1">Publicētie sludinājumi</h3>
          <p className="text-2xl font-semibold text-[#00332D]">—</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-1">Pēdējā atjaunošana</h3>
          <p className="text-2xl font-semibold text-[#00332D]">—</p>
        </div>
      </div>
    </div>
  )
}