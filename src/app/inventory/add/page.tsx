"use client";

import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { ComputerForm } from '@/components/inventory/ComputerForm';
import { useLanguage } from '@/context/LanguageContext';
import type { ComputerEntry } from '@/types/ComputerEntry';
import { useToast } from '@/hooks/use-toast';

export default function AddComputerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComputer = async (data: ComputerEntry) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to add computers.", variant: "destructive" });
        return; // Should be caught by ProtectedLayout, but good practice
    }
    setIsLoading(true);

    try {
      const computersRef = collection(db, 'computers');
      await addDoc(computersRef, {
        ...data,
        userId: user.uid, // Ensure userId is set
        createdAt: serverTimestamp(), // Use server timestamp
        updatedAt: serverTimestamp(),
      });
      toast({ title: t('addSuccess') });
      router.push('/'); // Redirect to inventory list after adding
    } catch (error) {
      console.error("Error adding computer:", error);
      toast({ title: t('addError'), variant: 'destructive' });
      setIsLoading(false); // Only set loading false on error, success redirects
    }
    // No finally block to set loading false, as success redirects
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('addComputer')}</h1>
      <ComputerForm onSubmit={handleAddComputer} isLoading={isLoading} onCancel={() => router.push('/')}/>
    </div>
  );
}
