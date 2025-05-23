
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ComputerEntry, ComputerEntryFirestoreData } from '@/types/ComputerEntry';
import { CheckCircle, XCircle, AlertCircle, PlusCircle, Edit, Trash2, ListFilter, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

interface DisplayComputerEntry extends ComputerEntry {
  displayName: string;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [computers, setComputers] = useState<ComputerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'compatible' | 'incompatible'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of item being deleted

  useEffect(() => {
    if (!user) {
      setLoading(false); // No user, stop loading
      setComputers([]); // Clear computers if user logs out
      return;
    };

    setLoading(true);
    const computersRef = collection(db, 'computers');
    // Query computers belonging to the current user, order by creation time descending
    const q = query(computersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const computersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ComputerEntry)); // Assume data matches ComputerEntry
      setComputers(computersData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching computers:", error);
        toast({ title: "Error fetching data", description: "Could not load computer inventory.", variant: "destructive" });
        setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user, toast]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id); // Set deleting state for this specific item
    try {
      await deleteDoc(doc(db, 'computers', id));
      toast({ title: t('deleteSuccess') });
    } catch (error) {
      console.error("Error deleting computer:", error);
      toast({ title: t('deleteError'), variant: 'destructive' });
    } finally {
      setIsDeleting(null); // Clear deleting state
    }
  };

  const filteredComputers: ComputerEntry[] = useMemo(() => {
    const secretKey = 'clave-super-secreta-123';
    return computers
      .map(computer => {
        if (typeof computer.computerName === 'string' && computer.computerName.length > 0) {
          try {
            const bytes = CryptoJS.AES.decrypt(computer.computerName, secretKey);
            if (bytes.sigBytes > 0) {
              computer.computerName = bytes.toString(CryptoJS.enc.Utf8);
            }
          } catch (e) {
            console.log(e);
          }
        }
        return computer;
      })
      .filter(comp => {
        const matchesSearch = comp.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              comp.computerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
                             (filter === 'compatible' && comp.isCompatible) ||
                             (filter === 'incompatible' && !comp.isCompatible);
        return matchesSearch && matchesFilter;
      });
  }, [computers, searchTerm, filter]);

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8 space-y-4">
         <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/4" />
             <Skeleton className="h-10 w-32" />
         </div>
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-40" />
          </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[...Array(3)].map((_, i) => (
              <Card key={i}>
                 <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                 </CardHeader>
                 <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                 </CardContent>
                 <CardFooter className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                     <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                     </div>
                 </CardFooter>
              </Card>
           ))}
         </div>
       </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t('inventory')}</h1>
        <Link href="/inventory/add" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('addComputer')}
          </Button>
        </Link>
      </div>

       {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
            />
            <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'compatible' | 'incompatible')}>
            <SelectTrigger className="w-full sm:w-[180px]">
                 <ListFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{t('showAll')}</SelectItem>
                <SelectItem value="compatible">{t('filterCompatible')}</SelectItem>
                <SelectItem value="incompatible">{t('filterIncompatible')}</SelectItem>
            </SelectContent>
            </Select>
        </div>


      {filteredComputers.length === 0 ? (
         <div className="text-center text-muted-foreground py-10">
            <p>{computers.length === 0 ? t('noComputers') : "No computers match your search/filter."}</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComputers.map((computer) => (
            <Card key={computer.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg truncate">{computer.computerName}</CardTitle>
                <CardDescription>
                    {t('assetTag')}: {computer.assetTag}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                 <p><span className="font-medium">{t('processor')}:</span> {computer.processor}</p>
                 <p><span className="font-medium">{t('ramSize')}:</span> {computer.ramSize} GB</p>
                 <p><span className="font-medium">{t('storageType')}:</span> {computer.storageType} {computer.storageSize} GB</p>
                 <div className="flex items-center pt-2">
                     <span className="font-medium mr-2">{t('status')}:</span>
                    {computer.isCompatible ? (
                        <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> {t('compatible')}
                        </span>
                    ) : (
                        <span className="flex items-center text-destructive">
                        <XCircle className="mr-1 h-4 w-4" /> {t('incompatible')}
                        </span>
                    )}
                     {computer.verifiedByTool && <span className='ml-2 text-xs text-muted-foreground'>({t('compatibilityVerified')})</span>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4">
                 <Link href={`/inventory/${computer.id}`} passHref>
                    <Button variant="outline" size="sm">{t('viewDetails')}</Button>
                 </Link>
                <div className="flex space-x-2">
                  <Link href={`/inventory/edit/${computer.id}`} passHref>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label={t('edit')}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" aria-label={t('delete')} disabled={isDeleting === computer.id}>
                         {isDeleting === computer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('confirmDeleteMessage')} <br/> ({computer.computerName} - {computer.assetTag})
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting === computer.id}>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(computer.id!)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          disabled={isDeleting === computer.id}
                        >
                          {isDeleting === computer.id ? t('loading') : t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
