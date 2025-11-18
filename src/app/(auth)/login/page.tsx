
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Head from "next/head";

const ADMIN_EMAILS = ["mtechitinstitute@gmail.com", "anooppbh8@gmail.com"];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // If user is already logged in, decide where to send them
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        router.push('/admin/dashboard');
      } else {
        router.push('/learn');
      }
    }
  }, [user, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    if (!email || !password) {
        toast({ title: "Error", description: "Please enter both email and password.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        });
        
        // Redirect based on user role
        if (userCredential.user.email && ADMIN_EMAILS.includes(userCredential.user.email)) {
            router.push('/admin/dashboard');
        } else {
            router.push('/learn');
        }

    } catch (error: any) {
         let errorMessage = "An unknown error occurred.";
         if (error.code) {
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/too-many-requests':
                     errorMessage = 'Too many requests. Please try again later.';
                     break;
                default:
                    errorMessage = 'Failed to login. Please try again.';
                    break;
            }
        }
        console.error("Firebase Auth Error:", error);
        toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - MTech IT Institute</title>
        <meta name="description" content="Login to your MTech IT Institute account to access your courses and learning materials." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Logo />
              </div>
               <CardTitle className="text-2xl font-headline">Login</CardTitle>
               <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Don't have an account?{' '}
                  <a href="/signup" className="underline">
                      Sign up
                  </a>
                 </div>
              </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
