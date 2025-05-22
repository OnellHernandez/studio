"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { ComputerForm } from '@/components/inventory/ComputerForm';
import { useLanguage } from '@/context/LanguageContext';
import type { ComputerEntry, ComputerEntryFirestoreData } from '@/types/ComputerEntry';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import CryptoJS from 'crypto-js';

export default function EditComputerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Get ID from route parameters
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [computerData, setComputerData] = useState<ComputerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return; // No ID or user, nothing to fetch
    }

    const fetchComputerData = async () => {
      setLoading(true);
      try {
        const computerDocRef = doc(db, 'computers', id);
        const docSnap = await getDoc(computerDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as ComputerEntryFirestoreData;
            // Ensure data belongs to the current user
            if (data.userId === user.uid) {
              const secretKey = 'clave-super-secreta-123'; 
              const bytes = CryptoJS.AES.decrypt(data.computerName, secretKey);
              const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
              data.computerName = decryptedText;
                 // Convert Timestamps back to Date objects or keep as Timestamps if schema expects them
                 // For Zod validation with Timestamps, ensure the schema uses z.instanceof(Timestamp)
                setComputerData({
                ...data,
                id: docSnap.id,
                // createdAt and updatedAt are already Timestamps
                });
            } else {
                 toast({ title: "Access Denied", description: "You do not have permission to edit this entry.", variant: "destructive" });
                 router.push('/'); // Redirect if not owner
            }

        } else {
          toast({ title: "Not Found", description: "Computer entry not found.", variant: "destructive" });
          router.push('/'); // Redirect if not found
        }
      } catch (error) {
        console.error("Error fetching computer data:", error);
        toast({ title: "Error", description: "Failed to load computer data.", variant: "destructive" });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchComputerData();
  }, [id, user, router, toast]);

  const handleUpdateComputer = async (data: ComputerEntry) => {
    if (!user || !id) return;
    setIsUpdating(true);

    try {
      const computerDocRef = doc(db, 'computers', id);
      // Prepare data for update, excluding id and potentially createdAt
      const { id: dataId, createdAt, ...updateData } = data;
      await updateDoc(computerDocRef, {
        ...updateData,
        updatedAt: serverTimestamp(), // Update the timestamp
      });
      toast({ title: t('updateSuccess') });
      router.push(`/inventory/${id}`); // Redirect to detail view after updating
    } catch (error) {
      console.error("Error updating computer:", error);
      toast({ title: t('updateError'), variant: "destructive" });
      setIsUpdating(false); // Allow retry on error
    }
     // No finally block needed for loading state due to redirect on success
  };

   if (loading) {
     return (
       <div className="container mx-auto px-4 py-8 space-y-8">
         <Skeleton className="h-8 w-1/3 mb-6" />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
             <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
             </div>
         </div>
          <Skeleton className="h-40 w-full" /> {/* Placeholder for Checklist */}
          <div className="flex justify-end space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
       </div>
     );
   }

   if (!computerData) {
     // Should have been redirected if not found, but handle just in case
     return <div className="container mx-auto px-4 py-8 text-center">{t('loading')}</div>;
   }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('edit')} {t('computerName')}: {computerData.computerName}</h1>
      <ComputerForm
        onSubmit={handleUpdateComputer}
        initialData={computerData}
        isLoading={isUpdating}
        onCancel={() => router.back()} // Go back to previous page
       />
    </div>
  );
}
