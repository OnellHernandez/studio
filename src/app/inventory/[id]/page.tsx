"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ComputerEntry, ComputerEntryFirestoreData } from '@/types/ComputerEntry';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, XCircle, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { CompatibilityChecklist } from '@/components/inventory/CompatibilityChecklist';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { format } from 'date-fns'; // For formatting dates


export default function ComputerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [computer, setComputer] = useState<ComputerEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id || !user) {
        setLoading(false);
        return;
    };

    const fetchComputer = async () => {
      setLoading(true);
      try {
        const computerDocRef = doc(db, 'computers', id);
        const docSnap = await getDoc(computerDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ComputerEntryFirestoreData;
           if (data.userId === user.uid) {
                setComputer({
                    ...data,
                    id: docSnap.id,
                    // Timestamps are handled correctly by CompatibilityChecklist and display logic
                });
           } else {
                toast({ title: "Access Denied", description: "You cannot view this entry.", variant: "destructive" });
                router.push('/');
           }
        } else {
          toast({ title: "Not Found", description: "Computer entry not found.", variant: "destructive" });
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching computer:", error);
        toast({ title: "Error", description: "Failed to load computer details.", variant: "destructive" });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchComputer();
  }, [id, user, router, toast]);

  const handleDelete = async () => {
     if (!id) return;
     setIsDeleting(true);
     try {
       await deleteDoc(doc(db, 'computers', id));
       toast({ title: t('deleteSuccess') });
       router.push('/'); // Redirect to inventory list after deleting
     } catch (error) {
       console.error("Error deleting computer:", error);
       toast({ title: t('deleteError'), variant: 'destructive' });
       setIsDeleting(false); // Allow retry on error
     }
  };

  // Helper to format Timestamp or Date
  const formatDate = (date: Timestamp | Date | undefined) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    try {
        // Example format: Jan 1, 2023 10:30 AM
        return format(dateObj, 'PPp');
    } catch (e) {
        console.error("Error formatting date:", e)
        return 'Invalid Date';
    }
  };


  if (loading) {
     return (
        <div className="container mx-auto px-4 py-8">
             <Skeleton className="h-6 w-32 mb-4" /> {/* Back button */}
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     {/* Details Column */}
                     <div className="space-y-3">
                         {[...Array(8)].map((_, i) => <Skeleton key={`detail-${i}`} className="h-5 w-full" />)}
                     </div>
                     {/* Checklist Column */}
                     <div className="space-y-3">
                         <Skeleton className="h-6 w-1/2 mb-4" />
                         {[...Array(6)].map((_, i) => <Skeleton key={`check-${i}`} className="h-5 w-full" />)}
                     </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </CardFooter>
             </Card>
        </div>
     )
  }

  if (!computer) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('loading')}</div>; // Should be redirected if not found
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToList')}
        </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{computer.computerName}</CardTitle>
                <CardDescription>{t('assetTag')}: {computer.assetTag}</CardDescription>
            </div>
             <div className={`flex items-center text-lg font-semibold ${computer.isCompatible ? 'text-green-600' : 'text-destructive'}`}>
                {computer.isCompatible ? (
                    <CheckCircle className="mr-2 h-5 w-5" />
                ) : (
                    <XCircle className="mr-2 h-5 w-5" />
                )}
                {computer.isCompatible ? t('compatible') : t('incompatible')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Computer Details */}
          <div className="space-y-3 text-sm">
             <h3 className="text-lg font-semibold mb-2 border-b pb-1">{t('details')}</h3>
             <p><strong className="font-medium">{t('processor')}:</strong> {computer.processor}</p>
             <p><strong className="font-medium">{t('ramSize')}:</strong> {computer.ramSize} GB</p>
             <p><strong className="font-medium">{t('storageType')}:</strong> {computer.storageType}</p>
             <p><strong className="font-medium">{t('storageSize')}:</strong> {computer.storageSize} GB</p>
             <p><strong className="font-medium">{t('tpmVersion')}:</strong> {computer.tpmVersion || 'N/A'}</p>
             <p><strong className="font-medium">{t('uefiSupport')}:</strong> {computer.uefiSupport ? t('yes') : t('no')}</p>
             <p><strong className="font-medium">{t('secureBootEnabled')}:</strong> {computer.secureBootEnabled ? t('yes') : t('no')}</p>
             <p><strong className="font-medium">Created At:</strong> {formatDate(computer.createdAt)}</p>
             <p><strong className="font-medium">Last Updated:</strong> {formatDate(computer.updatedAt)}</p>
             {computer.observations && (
                <div className="pt-2">
                    <strong className="font-medium">{t('observations')}:</strong>
                    <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{computer.observations}</p>
                </div>
             )}
          </div>

          {/* Compatibility Checklist */}
           <div>
                <CompatibilityChecklist values={computer} />
           </div>

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
           <Link href={`/inventory/edit/${computer.id}`} passHref>
                <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> {t('edit')}
                </Button>
            </Link>

             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                         {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                         {isDeleting ? t('loading') : t('delete')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('confirmDeleteMessage')} ({computer.computerName} - {computer.assetTag})
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                         {isDeleting ? t('loading') : t('delete')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </CardFooter>
      </Card>
    </div>
  );
}
