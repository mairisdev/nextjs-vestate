import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import TranslationManager from '../../components/admin/TranslationManager';

export default async function TranslationsAdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tulkojumu pārvaldība</h1>
        <p className="text-gray-600">Pārvaldīt valodu tulkojumus visām lapas sadaļām</p>
      </div>
      <TranslationManager />
    </div>
  );
}