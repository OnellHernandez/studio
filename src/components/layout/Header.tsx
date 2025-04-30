"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '@/context/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, LogOut } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

export function Header() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // User state will update via AuthProvider listener
    } catch (error) {
      console.error("Logout Error:", error);
      // Optionally show a toast message for logout error
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          {t('appName')}
        </Link>
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
           <Select value={language} onValueChange={(value) => setLanguage(value as Locale)}>
             <SelectTrigger className="w-auto gap-2 border-none text-sm text-muted-foreground hover:text-foreground focus:ring-0 focus:ring-offset-0">
                <Globe className="h-4 w-4" />
               <SelectValue placeholder={t('language')} />
             </SelectTrigger>
             <SelectContent align="end">
               <SelectItem value="en">{t('english')}</SelectItem>
               <SelectItem value="es">{t('spanish')}</SelectItem>
             </SelectContent>
           </Select>


          {user && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
               <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
