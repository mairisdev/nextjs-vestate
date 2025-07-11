import { Globe, Settings, FileText, Users, BarChart, Building } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const quickActions = [
    {
      title: "Tulkojumi",
      description: "Pārvaldīt valodu tulkojumus",
      href: "/admin/translations",
      icon: <Globe className="h-8 w-8 text-blue-600" />,
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Īpašumi",
      description: "Pārvaldīt nekustamos īpašumus",
      href: "/admin/properties",
      icon: <Building className="h-8 w-8 text-green-600" />,
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Aģenti",
      description: "Pārvaldīt komandas biedrus",
      href: "/admin/agents",
      icon: <Users className="h-8 w-8 text-purple-600" />,
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Statistika",
      description: "Apskatīt darbības rādītājus",
      href: "/admin/statistics",
      icon: <BarChart className="h-8 w-8 text-orange-600" />,
      color: "bg-orange-50 border-orange-200"
    },
    {
      title: "Navigācija",
      description: "Konfigurēt galveno izvēlni",
      href: "/admin/navigation",
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      color: "bg-gray-50 border-gray-200"
    },
    {
      title: "Saturs",
      description: "Pārvaldīt lapas saturu",
      href: "/admin/content",
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-200"
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin panelis</h1>
        <p className="text-gray-600">Pārvaldīt Vestate satura pārvaldības sistēmu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`${action.color} border-2 p-6 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Kopā īpašumi
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">142</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Aktīvi aģenti
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Atsauksmes
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">67</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Tulkojumi
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">245</p>
        </div>
      </div>
    </div>
  );
}