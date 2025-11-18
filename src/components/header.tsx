
"use client";

import Link from "next/link";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import LearnSidebar from "./learn/sidebar"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { NavItem } from "@/lib/types";

const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Courses", href: "/courses" },
  { title: "Learn", href: "/learn" },
  { title: "Tests", href: "/mock-tests" },
  { title: "Registration", href: "/exam/register" },
  { title: "Blog", href: "/blog" },
  { title: "Career", href: "/career" },
  { title: "Resources", href: "/resources" },
  { title: "Contact", href: "/contact" },
];

const ADMIN_EMAILS = ["mtechitinstitute@gmail.com", "anooppbh8@gmail.com"];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const auth = useAuth();
  const { user, isLoading } = useUser();
  const router = useRouter();

  const isLearnPage = pathname.startsWith('/learn');
  const courseSlug = isLearnPage && pathname.split('/')[2] ? pathname.split('/')[2] : '';

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/');
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />

        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => {
            if (item.href === '/learn' && !user && !isLoading) return null;
            return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent",
                    pathname === item.href
                      ? "text-accent"
                      : "text-foreground/70"
                  )}
                >
                  {item.title}
                </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
            {!isLoading && (
              user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                                <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                           </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isAdmin ? (
                            <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                               <LayoutDashboard className="mr-2 h-4 w-4" />
                               <span>Dashboard</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => router.push('/learn')}>
                               <LayoutDashboard className="mr-2 h-4 w-4" />
                               <span>My Learning</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild className="hidden md:inline-flex">
                     <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild className="hidden md:inline-flex">
                     <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )
            )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80">
            <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
              {isLearnPage && courseSlug ? (
                <LearnSidebar courseSlug={courseSlug} isMobile onLinkClick={() => setIsOpen(false)} />
              ) : (
                <>
                  <nav className="grid grid-flow-row auto-rows-max text-sm">
                    {navItems.map((item) => {
                      if (item.href === '/learn' && !user) return null;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline",
                            pathname === item.href ? "text-accent" : "text-foreground/70"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.title}
                        </Link>
                      )
                    })}
                  </nav>
                  {!user && (
                    <div className="flex flex-col gap-2">
                        <Button className="w-full" asChild onClick={() => setIsOpen(false)}><Link href="/login">Log In</Link></Button>
                        <Button className="w-full" variant="outline" asChild onClick={() => setIsOpen(false)}><Link href="/signup">Sign Up</Link></Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
