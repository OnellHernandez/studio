"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, doc} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Asumiendo que db se exporta correctamente desde aquí
import type { Firestore } from "firebase/firestore"; // Importa el tipo Firestore

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
        return; // Should be caught by ProtectedLayout, but good practice
    }
    setIsLoading(true);

    try {
      // Encrypt the computer name with AES
      data.computerName = CryptoJS.AES.encrypt(data.computerName, secretKey).toString();
      const computersRef = collection(db, 'computers');
      console.log("DataEncrypted: ", data);

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
