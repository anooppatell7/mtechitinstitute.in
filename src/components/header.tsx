
"use client";

import Link from "next/link";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, UserCircle, ChevronDown, BookOpen, GraduationCap, FileText, ListTodo, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { NavItem } from "@/lib/types";
import React from "react";


const ADMIN_EMAILS = ["mtechitinstitute@gmail.com", "anooppbh8@gmail.com"];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const auth = useAuth();
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLearnPage = pathname.startsWith('/learn');
  const courseSlug = isLearnPage && pathname.split('/')[2] ? pathname.split('/')[2] : '';

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    if (user && !isAdmin) {
      const checkRegistration = async () => {
        const docRef = doc(db, "examRegistrations", user.uid);
        const docSnap = await getDoc(docRef);
        setIsRegistered(docSnap.exists());
      };
      checkRegistration();
    } else if (isAdmin) {
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }
  }, [user, isAdmin]);

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/');
    }
  }
  
  const academicsComponents: { title: string; href: string; description: string }[] = [
    {
      title: "Our Courses",
      href: "/courses",
      description: "Explore job-oriented courses in web development, marketing, and more.",
    },
    {
      title: "Interactive Learning",
      href: "/learn",
      description: "Learn at your own pace with hands-on, interactive lessons and quizzes.",
    },
    {
      title: "Free Resources",
      href: "/resources",
      description: "Access free PDF notes, worksheets, and study materials to aid your learning.",
    },
     {
      title: "Career Guidance",
      href: "/career",
      description: "Get expert advice on navigating your career path in the tech industry.",
    },
  ];

  const examsComponents: { title: string; href: string; description: string, auth: boolean, registeredOnly: boolean, hideWhenRegistered: boolean }[] = [
    {
      title: "Exam Portal",
      href: "/exam",
      description: "Access official exams for registered students to get certified.",
      auth: true,
      registeredOnly: true,
      hideWhenRegistered: false,
    },
    {
      title: "Mock Tests",
      href: "/mock-tests",
      description: "Practice with our collection of mock tests to prepare for your exams.",
      auth: false,
      registeredOnly: false,
      hideWhenRegistered: false,
    },
    {
      title: "Exam Registration",
      href: "/exam/register",
      description: "Register here to become an official student and take certification exams.",
      auth: true,
      registeredOnly: false,
      hideWhenRegistered: true,
    },
  ];


  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Logo />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />

        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref><NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink></Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/about" legacyBehavior passHref><NavigationMenuLink className={navigationMenuTriggerStyle()}>About</NavigationMenuLink></Link>
                </NavigationMenuItem>
                 <NavigationMenuItem>
                    <NavigationMenuTrigger>Academics</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        {academicsComponents.map((component) => (
                          <ListItem key={component.title} title={component.title} href={component.href}>
                            {component.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                 <NavigationMenuItem>
                    <NavigationMenuTrigger>Exams</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                        {examsComponents.map((component) => {
                           if (component.auth && !user) return null;
                           if (component.registeredOnly && !isRegistered) return null;
                           if (component.hideWhenRegistered && isRegistered && !isAdmin) return null;
                           return (
                              <ListItem key={component.title} title={component.title} href={component.href}>
                                {component.description}
                              </ListItem>
                           )
                        })}
                      </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/blog" legacyBehavior passHref><NavigationMenuLink className={navigationMenuTriggerStyle()}>Blog</NavigationMenuLink></Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/verify-certificate" legacyBehavior passHref><NavigationMenuLink className={navigationMenuTriggerStyle()}>Verify Certificate</NavigationMenuLink></Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/contact" legacyBehavior passHref><NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact</NavigationMenuLink></Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

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
                          <>
                            <DropdownMenuItem onClick={() => router.push('/profile')}>
                               <UserCircle className="mr-2 h-4 w-4" />
                               <span>My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/learn')}>
                               <LayoutDashboard className="mr-2 h-4 w-4" />
                               <span>My Learning</span>
                            </DropdownMenuItem>
                          </>
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
                <nav className="grid grid-flow-row auto-rows-max text-sm">
                    <Link href="/" className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link href="/about" className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>About</Link>
                    
                    <Accordion type="multiple" className="w-full">
                        <AccordionItem value="academics">
                             <AccordionTrigger className="p-2 text-sm font-medium hover:underline">Academics</AccordionTrigger>
                             <AccordionContent className="pl-4">
                                {academicsComponents.map(item => (
                                    <Link key={item.href} href={item.href} className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>{item.title}</Link>
                                ))}
                             </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="exams">
                             <AccordionTrigger className="p-2 text-sm font-medium hover:underline">Exams</AccordionTrigger>
                             <AccordionContent className="pl-4">
                                {examsComponents.map(item => {
                                    if (item.auth && !user) return null;
                                    if (item.registeredOnly && !isRegistered) return null;
                                    if (item.hideWhenRegistered && isRegistered && !isAdmin) return null;
                                    return (<Link key={item.href} href={item.href} className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>{item.title}</Link>)
                                })}
                             </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                     <Link href="/blog" className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>Blog</Link>
                     <Link href="/verify-certificate" className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>Verify Certificate</Link>
                     <Link href="/contact" className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>Contact</Link>
                </nav>
                {!user && (
                  <div className="flex flex-col gap-2">
                      <Button className="w-full" asChild onClick={() => setIsOpen(false)}><Link href="/login">Log In</Link></Button>
                      <Button className="w-full" variant="outline" asChild onClick={() => setIsOpen(false)}><Link href="/signup">Sign Up</Link></Button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

