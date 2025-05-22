
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Removed getDocs, updateDoc, doc
import { db } from '@/lib/firebase';
import type { Firestore } from "firebase/firestore";

import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ComputerForm } from '@/components/inventory/ComputerForm';
import type { ComputerEntry } from '@/types/ComputerEntry';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

export default function AddComputerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const secretKey = 'clave-super-secreta-123'; 

  const handleAddComputer = async (data: ComputerEntry) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to add computers.", variant: "destructive" });
        return; 
    }
    setIsLoading(true);

    const dataToSave = { ...data };

    // Encrypt the computer name with AES if it exists
    if (dataToSave.computerName && typeof dataToSave.computerName === 'string') {
        dataToSave.computerName = CryptoJS.AES.encrypt(dataToSave.computerName, secretKey).toString();
    }

    try {
      const computersRef = collection(db, 'computers');
      // console.log("Data to be saved:", dataToSave);

      // The problematic data migration loop has been removed.
      // This function will now only focus on adding the new computer entry.

      await addDoc(computersRef, {
        ...dataToSave,
        userId: user.uid, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp(),
      });
      toast({ title: t('addSuccess') });
      router.push('/'); 
    } catch (error) {
      console.error("Error adding computer:", error);
      toast({ title: t('addError'), variant: 'destructive' });
      setIsLoading(false); 
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('addComputer')}</h1>
      <ComputerForm onSubmit={handleAddComputer} isLoading={isLoading} onCancel={() => router.push('/')}/>
    </div>
  );
}
