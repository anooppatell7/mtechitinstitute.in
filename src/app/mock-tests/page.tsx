'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, Search, X } from "lucide-react";
import type { TestCategory } from "@/lib/types";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import SectionDivider from "@/components/section-divider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function CategoryLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="flex-row items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function MockTestCategoriesPage() {
    const [categories, setCategories] = useState<TestCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const categoriesQuery = query(collection(db, "testCategories"));
                const querySnapshot = await getDocs(categoriesQuery);
                const categoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestCategory));
                setCategories(categoryList);
            } catch (error) {
                console.error("Failed to fetch test categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);
    
    const filteredCategories = useMemo(() => {
        if (!searchTerm) {
            return categories;
        }
        return categories.filter(category =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    return (
         <>
            <div className="bg-background">
                <div className="container py-16 sm:py-24 text-center">
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Online Mock Tests<span className="text-accent">.</span></h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                        Select a category to start practicing and test your knowledge.
                    </p>
                </div>
            </div>
            
            <div className="bg-secondary relative">
                <SectionDivider style="wave" className="text-background" position="top"/>
                <div className="container py-16 sm:py-24">
                    <div className="mb-12 max-w-lg mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search categories like 'MS Word', 'Tally'..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-base"
                        />
                         {searchTerm && (
                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                               <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <CategoryLoadingSkeleton />
                    ) : filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCategories.map((category) => (
                                <Link key={category.id} href={`/mock-tests/category/${category.id}`} className="group">
                                  <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow bg-background border-t-4 border-t-accent">
                                      <CardHeader className="flex-row items-center gap-4">
                                          <div className="text-4xl p-3 bg-accent/10 text-accent rounded-full">
                                            {category.icon ? <span>{category.icon}</span> : <FileText />}
                                          </div>
                                          <div>
                                              <CardTitle className="font-headline text-xl text-primary group-hover:text-accent transition-colors">{category.title}</CardTitle>
                                          </div>
                                      </CardHeader>
                                      <CardContent className="flex-grow">
                                        <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                                      </CardContent>
                                       <div className="p-6 pt-0 text-sm font-semibold text-accent flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          View Tests <ArrowRight className="h-4 w-4" />
                                      </div>
                                  </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                <p className="text-lg">No test categories found.</p>
                                <p className="mt-2 text-sm">{searchTerm ? "Try a different search term." : "Please check back later."}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
