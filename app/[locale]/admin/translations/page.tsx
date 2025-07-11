import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import TranslationManager from '../../../components/admin/TranslationManager';

export default async function TranslationsAdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <TranslationManager />
    </div>
  );
}
