"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react'; // For loading state

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: t('loginSuccess') });
      // Redirect or state update handled by AuthProvider
    } catch (error) {
      console.error("Login Error:", error);
      toast({ title: t('loginError'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: t('signupSuccess') });
      setActiveTab('login'); // Switch to login tab after signup
      setEmail(''); // Clear fields
      setPassword('');
    } catch (error) {
      console.error("Signup Error:", error);
      let errorMessage = t('signupError');
       if (error instanceof Error) {
          // More specific error messages if needed
         if ((error as any).code === 'auth/email-already-in-use') {
           errorMessage = 'Email already in use. Please login or use a different email.';
         } else if ((error as any).code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Please choose a stronger password.';
         }
       }
      toast({ title: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t('login')}</CardTitle>
                <CardDescription>{t('loginPrompt')}</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('email')}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('signIn')}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>{t('signUp')}</CardTitle>
                 <CardDescription>Create an account to manage inventory.</CardDescription>
              </CardHeader>
               <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-email">{t('email')}</Label>
                     <Input
                       id="signup-email"
                       type="email"
                       placeholder="you@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       disabled={loading}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signup-password">{t('password')}</Label>
                     <Input
                       id="signup-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       minLength={6} // Basic password strength
                       disabled={loading}
                     />
                   </div>
                </CardContent>
                <CardFooter>
                   <Button type="submit" className="w-full" disabled={loading}>
                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {t('signUp')}
                   </Button>
                </CardFooter>
               </form>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
