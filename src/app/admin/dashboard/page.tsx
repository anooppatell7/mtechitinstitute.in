
'use client';

import Link from "next/link";
import React, { useState, useEffect, use } from "react";
import { PlusCircle, MoreHorizontal, LogOut, Trash, Edit, Settings, FileText, MessageSquare, Briefcase, Link2, Megaphone, Star, Upload, BookOpen, Layers, ChevronDown, ListTodo, BookCopy, UserCheck, Award, Tv, Database, Loader2, Users, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Course, BlogPost, Resource, Enrollment, ContactSubmission, InternalLink, SiteSettings, Review, LearningCourse, LearningModule, Lesson, MockTest, TestQuestion, TestCategory, ExamRegistration, ExamResult, Certificate, PopupSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { signOut, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import coursesData from "@/lib/data/courses.json";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, Timestamp, where, arrayUnion, arrayRemove, getDoc, writeBatch, onSnapshot, Unsubscribe, runTransaction } from "firebase/firestore";
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type ItemType = 'courses' | 'blog' | 'guidance' | 'resources' | 'settings' | 'enrollments' | 'contacts' | 'internal-links' | 'site-settings' | 'reviews' | 'learningCourse' | 'learningModule' | 'learningLesson' | 'mockTest' | 'testQuestion' | 'testCategory' | 'examRegistration' | 'examResult' | 'certificate';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [learningCourses, setLearningCourses] = useState<LearningCourse[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [guidanceArticles, setGuidanceArticles] = useState<BlogPost[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [mockTests, setMockTests] = useState<MockTest[]>([]);
    const [testCategories, setTestCategories] = useState<TestCategory[]>([]);
    const [examRegistrations, setExamRegistrations] = useState<ExamRegistration[]>([]);
    const [examResults, setExamResults] = useState<ExamResult[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingRegNo, setGeneratingRegNo] = useState<string | null>(null);
    const { toast } = useToast();
    
    // State for registration analytics
    const [registrationStats, setRegistrationStats] = useState<{ total: number; byCourse: Record<string, number> }>({ total: 0, byCourse: {} });


    // Site settings state
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({ id: 'announcement', text: '', link: '', isVisible: false });
    const [popupSettings, setPopupSettings] = useState<PopupSettings>({ id: 'salesPopup', isVisible: false, title: '', description: '', imageUrl: '', ctaText: '', ctaLink: '' });


    // Internal linking state
    const [allBlogPostsForLinks, setAllBlogPostsForLinks] = useState<BlogPost[]>([]);
    const [selectedSourcePost, setSelectedSourcePost] = useState<string>("");
    const [selectedTargetPost, setSelectedTargetPost] = useState<string>("");
    const [linkKeyword, setLinkKeyword] = useState<string>("");
    const [isLinkSaving, setIsLinkSaving] = useState(false);

    // Audio for notification
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    useEffect(() => {
        setAudio(new Audio('/notification.mp3'));
    }, []);

    const playNotificationSound = () => {
        audio?.play().catch(error => console.error("Error playing sound:", error));
    };


    useEffect(() => {
        if (isUserLoading) return;
        if (!user) {
            router.push('/login');
            return;
        } 
        if (!firestore) {
            setLoading(false);
            return;
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                // Courses
                const coursesCollection = collection(firestore, "courses");
                const courseSnapshot = await getDocs(coursesCollection);
                const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(courseList);

                // Blog Posts
                const blogQuery = query(collection(firestore, "blog"), orderBy("date", "desc"));
                const blogSnapshot = await getDocs(blogQuery);
                const allPosts = blogSnapshot.docs.map(doc => ({ ...doc.data(), slug: doc.id } as BlogPost));
                
                setAllBlogPostsForLinks(allPosts); // For internal linking dropdowns
                setBlogPosts(allPosts.filter(post => post.category !== "Career Guidance"));
                setGuidanceArticles(allPosts.filter(post => post.category === "Career Guidance"));

                 // Learning Courses
                const learningCoursesQuery = query(collection(firestore, "learningCourses"), orderBy("order"));
                const learningCoursesSnapshot = await getDocs(learningCoursesQuery);
                const learningCoursesList = await Promise.all(learningCoursesSnapshot.docs.map(async (courseDoc) => {
                    const courseData = { id: courseDoc.id, ...courseDoc.data() } as LearningCourse;
                    
                    const modulesQuery = query(collection(firestore, "learningCourses", courseDoc.id, "modules"), orderBy("order"));
                    const modulesSnapshot = await getDocs(modulesQuery);
                    
                    courseData.modules = await Promise.all(modulesSnapshot.docs.map(async (moduleDoc) => {
                        const moduleData = { id: moduleDoc.id, ...moduleDoc.data() } as LearningModule;

                        const lessonsQuery = query(collection(firestore, "learningCourses", courseDoc.id, "modules", moduleDoc.id, "lessons"), orderBy("order"));
                        const lessonsSnapshot = await getDocs(lessonsQuery);
                        moduleData.lessons = lessonsSnapshot.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
                        
                        return moduleData;
                    }));

                    return courseData;
                }));
                setLearningCourses(learningCoursesList);

                // Resources
                const resourcesCollection = collection(firestore, "resources");
                const resourceSnapshot = await getDocs(resourcesCollection);
                const resourceList = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
                setResources(resourceList);

                // Reviews
                const reviewsQuery = query(collection(firestore, "reviews"), orderBy("submittedAt", "desc"));
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviewList = reviewsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
                    return { id: doc.id, ...data, submittedAt } as Review;
                });
                setReviews(reviewList);
                
                // Test Categories
                const categoriesQuery = query(collection(firestore, "testCategories"));
                const categoriesSnapshot = await getDocs(categoriesQuery);
                const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestCategory));
                setTestCategories(categoriesList);


                // Mock Tests
                const mockTestsQuery = query(collection(firestore, "mockTests"));
                const mockTestsSnapshot = await getDocs(mockTestsQuery);
                const mockTestsList = mockTestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
                setMockTests(mockTestsList);

                // Exam Results
                const examResQuery = query(collection(firestore, "examResults"), orderBy("submittedAt", "desc"));
                const examResSnapshot = await getDocs(examResQuery);
                const examResList = examResSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
                    return { id: doc.id, ...data, submittedAt } as ExamResult;
                });
                setExamResults(examResList);

                // Certificates
                const certsQuery = query(collection(firestore, "certificates"), orderBy("issueDate", "desc"));
                const certsSnapshot = await getDocs(certsQuery);
                const certsList = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
                setCertificates(certsList);


                // Site Settings
                const announcementDoc = await getDoc(doc(firestore, "site_settings", "announcement"));
                if (announcementDoc.exists()) {
                    setSiteSettings(announcementDoc.data() as SiteSettings);
                }
                const popupDoc = await getDoc(doc(firestore, "site_settings", "salesPopup"));
                if (popupDoc.exists()) {
                    setPopupSettings(popupDoc.data() as PopupSettings);
                }


            } catch (error) {
                console.error("Error fetching data: ", error);
                toast({ title: "Error", description: "Could not fetch data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const now = new Date();
        const unsubscribes: Unsubscribe[] = [];

        const setupListener = <T extends { id: string }>(
            collectionName: string, 
            stateSetter: React.Dispatch<React.SetStateAction<T[]>>,
            toastTitle: string,
            nameField: keyof T,
            dateField: keyof T
        ) => {
            const q = query(collection(firestore, collectionName), where(dateField, ">", now));
            const unsub = onSnapshot(q, (snapshot) => {
                let didUpdate = false;
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const data = change.doc.data() as T;
                        toast({ title: toastTitle, description: `From: ${data[nameField]}` });
                        playNotificationSound();
                        didUpdate = true;
                    }
                });
                if (didUpdate) {
                     // Refetch all data for this collection to update the list
                     const fullQuery = query(collection(firestore, collectionName), orderBy(dateField as string, "desc"));
                     getDocs(fullQuery).then(fullSnapshot => {
                         const fullList = fullSnapshot.docs.map(doc => {
                             const data = doc.data();
                             const date = (data[dateField] as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
                             return { id: doc.id, ...data, [dateField]: date, isRead: data.isRead || false } as T;
                         });
                         stateSetter(fullList);
                     });
                }
            }, (error) => {
                console.error(`Error listening to ${collectionName}:`, error);
            });
            unsubscribes.push(unsub);
        };

        setupListener<Enrollment>("enrollments", setEnrollments, "New Enrollment", "name", "submittedAt");
        setupListener<ContactSubmission>("contacts", setContacts, "New Contact Message", "name", "submittedAt");
        setupListener<ExamRegistration>("examRegistrations", setExamRegistrations, "New Exam Registration", "fullName", "registeredAt");

        const fetchInitialSubmissions = async () => {
             const initialEnrollmentsQuery = query(collection(firestore, "enrollments"), orderBy("submittedAt", "desc"));
             const enrollmentSnapshot = await getDocs(initialEnrollmentsQuery);
             const enrollmentList = enrollmentSnapshot.docs.map(doc => {
              const data = doc.data();
              const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
              return { id: doc.id, ...data, submittedAt, isRead: data.isRead || false } as Enrollment;
            });
            setEnrollments(enrollmentList);

             const initialContactsQuery = query(collection(firestore, "contacts"), orderBy("submittedAt", "desc"));
            const contactSnapshot = await getDocs(initialContactsQuery);
            const contactList = contactSnapshot.docs.map(doc => {
              const data = doc.data();
              const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
              return { id: doc.id, ...data, submittedAt } as ContactSubmission;
            });
            setContacts(contactList);

             const initialExamRegQuery = query(collection(firestore, "examRegistrations"), orderBy("registeredAt", "desc"));
            const examRegSnapshot = await getDocs(initialExamRegQuery);
            const examRegList = examRegSnapshot.docs.map(doc => {
                const data = doc.data();
                const registeredAt = (data.registeredAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
                return { id: doc.id, ...data, registeredAt, isRead: data.isRead || false } as ExamRegistration;
            });
            setExamRegistrations(examRegList);
        }
        fetchInitialSubmissions();

        return () => {
            unsubscribes.forEach(unsub => unsub());
        }

    }, [user, isUserLoading, router, firestore, toast, audio]);

    // Process analytics when examRegistrations data changes
    useEffect(() => {
        if (examRegistrations.length > 0) {
            const total = examRegistrations.length;
            const byCourse = examRegistrations.reduce((acc, reg) => {
                const courseName = reg.course || 'Unknown';
                acc[courseName] = (acc[courseName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            setRegistrationStats({ total, byCourse });
        }
    }, [examRegistrations]);


    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{type: ItemType, id: string, parentIds?: { courseId?: string, moduleId?: string, testId?: string }} | null>(null);
    const [linkToDelete, setLinkToDelete] = useState<{postSlug: string, link: InternalLink} | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formParentIds, setFormParentIds] = useState<{ courseId?: string, moduleId?: string, testId?: string } | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    
    const [settingsFormData, setSettingsFormData] = useState({
        currentPassword: '',
        newEmail: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const openConfirmationDialog = (type: ItemType, id: string, parentIds?: { courseId?: string, moduleId?: string, testId?: string }) => {
        setItemToDelete({ type, id, parentIds });
        setDialogOpen(true);
    };

    const openLinkDeleteDialog = (postSlug: string, link: InternalLink) => {
        setLinkToDelete({ postSlug, link });
        setDialogOpen(true);
    }
    
    const handleMarkAsRead = (type: 'enrollments' | 'examRegistrations', id: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, type, id);
        updateDoc(docRef, { isRead: true }).then(() => {
            if (type === 'enrollments') {
                setEnrollments(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
            } else if (type === 'examRegistrations') {
                setExamRegistrations(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
            }
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: { isRead: true },
              } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    }


    const handleDelete = async () => {
        if (!firestore) return;
        if (itemToDelete) {
            const { type, id, parentIds } = itemToDelete;
            let docRef: any;
            let operation: 'delete' | 'update' = 'delete';

            switch (type) {
                case 'courses': docRef = doc(firestore, "courses", id); break;
                case 'blog': case 'guidance': docRef = doc(firestore, "blog", id); break;
                case 'resources': docRef = doc(firestore, "resources", id); break;
                case 'enrollments': docRef = doc(firestore, "enrollments", id); break;
                case 'contacts': docRef = doc(firestore, "contacts", id); break;
                case 'reviews': docRef = doc(firestore, "reviews", id); break;
                case 'learningCourse': docRef = doc(firestore, "learningCourses", id); break;
                case 'learningModule': if (parentIds?.courseId) docRef = doc(firestore, "learningCourses", parentIds.courseId, "modules", id); break;
                case 'learningLesson': if (parentIds?.courseId && parentIds?.moduleId) docRef = doc(firestore, "learningCourses", parentIds.courseId, "modules", parentIds.moduleId, "lessons", id); break;
                case 'testCategory': docRef = doc(firestore, "testCategories", id); break;
                case 'examRegistration': docRef = doc(firestore, "examRegistrations", id); break;
                case 'examResult': docRef = doc(firestore, "examResults", id); break;
                case 'certificate': docRef = doc(firestore, "certificates", id); break;
                case 'mockTest':
                    docRef = doc(firestore, "mockTests", id);
                    // Special handling for associated test results (consider if this needs permission error handling too)
                    const resultsQuery = query(collection(firestore, "testResults"), where("testId", "==", id));
                    getDocs(resultsQuery).then(resultsSnapshot => {
                        const batch = writeBatch(firestore);
                        resultsSnapshot.docs.forEach(resultDoc => batch.delete(resultDoc.ref));
                        batch.commit();
                    });
                    break;
                case 'testQuestion':
                    if (parentIds?.testId) {
                        operation = 'update';
                        const testRef = doc(firestore, "mockTests", parentIds.testId);
                        docRef = testRef;
                        getDoc(testRef).then(testDoc => {
                            if (testDoc.exists()) {
                                const testData = testDoc.data() as MockTest;
                                const updatedQuestions = testData.questions.filter(q => q.id !== id);
                                updateDoc(testRef, { questions: updatedQuestions });
                            }
                        });
                    }
                    break;
            }

            if (docRef && operation === 'delete') {
                deleteDoc(docRef).then(() => {
                    toast({ title: "Success", description: "Item deleted successfully." });
                }).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path,
                        operation: 'delete',
                      } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
            } else if (docRef && operation === 'update') {
                // This part is already handled inside the case, but a general catch can be added.
                toast({ title: "Success", description: "Item deleted successfully." });
            }

            setItemToDelete(null);
        } else if (linkToDelete && firestore) {
            const { postSlug, link } = linkToDelete;
            const postRef = doc(firestore, "blog", postSlug);
            updateDoc(postRef, { internalLinks: arrayRemove(link) })
                .then(() => {
                    toast({ title: "Success", description: "Internal link removed." });
                })
                .catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: postRef.path,
                        operation: 'update',
                        requestResourceData: { internalLinks: arrayRemove(link) }
                      } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
            setLinkToDelete(null);
        }
        setDialogOpen(false);
    };
    
    const handleAddNew = (parentIds: { courseId?: string, moduleId?: string, testId?: string } | null = null) => {
        setEditingItem(null);
        let initialData: any = {};
        if (activeTab === 'guidance') {
            initialData = { category: "Career Guidance" };
        }
        if (activeTab === 'learn-content' && parentIds?.courseId) {
            setFormParentIds(parentIds);
        } else if (activeTab === 'mock-tests' && parentIds?.testId) {
            setFormParentIds(parentIds);
        } else {
            setFormParentIds(null);
        }
        setFormData(initialData);
        setIsFormOpen(true);
    };

    const handleEdit = (item: any, parentIds: { courseId?: string, moduleId?: string, testId?: string } | null = null) => {
        setEditingItem(item);
        setFormData(item);
        if (parentIds) {
            setFormParentIds(parentIds);
        }
        setIsFormOpen(true);
    };
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
        setFormData({});
        setFormParentIds(null);
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if ((e.target as HTMLInputElement).type === 'checkbox') {
             setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
             return;
        }

        if (name === 'tags' || name === 'syllabus') {
            setFormData({ ...formData, [name]: value.split(',').map(s => s.trim()) });
        } else if (name.startsWith('option')) { // For test question options
            const index = parseInt(name.split('-')[1]);
            const newOptions = [...(formData.options || ['', '', '', ''])];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        } else if (type === 'number') {
             setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const createSlug = (title: string) => {
      if (!title) return '';
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
        .trim()
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
    };

    const convertToDirectDownloadLink = (url: string): string => {
        if (!url) return url;
        const gDriveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match = url.match(gDriveRegex);
        if (match && match[1]) {
            const fileId = match[1];
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
        return url; // Return original URL if it doesn't match
    };

    const handleInternalLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        if (!selectedSourcePost || !selectedTargetPost || !linkKeyword) {
            toast({ title: "Error", description: "Please fill all fields for internal linking.", variant: "destructive" });
            return;
        }
        if (selectedSourcePost === selectedTargetPost) {
            toast({ title: "Error", description: "Source and Target post cannot be the same.", variant: "destructive" });
            return;
        }

        setIsLinkSaving(true);
        const targetPost = allBlogPostsForLinks.find(p => p.slug === selectedTargetPost);
        if (!targetPost) {
            toast({ title: "Error", description: "Target post not found", variant: "destructive" });
            setIsLinkSaving(false);
            return;
        }
        
        const newLink: InternalLink = {
            keyword: linkKeyword,
            url: `/blog/${targetPost.slug}`,
            title: targetPost.title,
        };
        
        const sourcePostRef = doc(firestore, "blog", selectedSourcePost);
        updateDoc(sourcePostRef, { internalLinks: arrayUnion(newLink) })
            .then(() => {
                toast({ title: "Success", description: "Internal link added successfully." });
                setSelectedSourcePost("");
                setSelectedTargetPost("");
                setLinkKeyword("");
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: sourcePostRef.path,
                    operation: 'update',
                    requestResourceData: { internalLinks: arrayUnion(newLink) }
                  } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsLinkSaving(false);
            });
    };


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        
        let collectionRef: any;
        let dataToSave = { ...formData };
        let docId: string | undefined = (editingItem as any)?.id;
        
        delete dataToSave.id;
        if ('modules' in dataToSave) delete dataToSave.modules;
        if ('lessons' in dataToSave) delete dataToSave.lessons;
        
        if (activeTab === 'courses') {
            collectionRef = collection(firestore, "courses");
            dataToSave.image = dataToSave.image || "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png";
            dataToSave.actualPrice = String(dataToSave.actualPrice || '');
            dataToSave.discountPrice = String(dataToSave.discountPrice || '');
            dataToSave.isFeatured = !!dataToSave.isFeatured;
        } else if (activeTab === 'blog' || activeTab === 'guidance') {
            collectionRef = collection(firestore, "blog");
            docId = (editingItem as BlogPost)?.slug;
            if (!docId) {
                docId = createSlug(dataToSave.title);
                if (!docId) { toast({title: "Error", description: "Blog post must have a title.", variant: "destructive"}); return; }
                dataToSave.internalLinks = [];
            }
            dataToSave.image = dataToSave.image || `https://picsum.photos/seed/${dataToSave.title || 'blog'}/800/450`;
        } else if (activeTab === 'resources') {
            collectionRef = collection(firestore, "resources");
            if (dataToSave.fileUrl) {
                dataToSave.fileUrl = convertToDirectDownloadLink(dataToSave.fileUrl);
            }
        } else if (activeTab === 'learn-content') {
             if (formParentIds?.courseId) {
                if (formParentIds.moduleId) {
                    collectionRef = collection(firestore, "learningCourses", formParentIds.courseId, "modules", formParentIds.moduleId, "lessons");
                } else {
                    collectionRef = collection(firestore, "learningCourses", formParentIds.courseId, "modules");
                }
            } else {
                collectionRef = collection(firestore, "learningCourses");
            }
        } else if (activeTab === 'test-categories') {
             collectionRef = collection(firestore, "testCategories");
             docId = (editingItem as any)?.id || dataToSave.id;
             if (!docId) {
                 docId = createSlug(dataToSave.title);
                 if (!docId) { toast({title: "Error", description: "Category must have a title.", variant: "destructive"}); return; }
             }
             dataToSave.id = docId;
        } else if (activeTab === 'mock-tests') {
            if(formParentIds?.testId) {
                const testRef = doc(firestore, "mockTests", formParentIds.testId);
                const testDoc = await getDoc(testRef);
                let testData: MockTest | undefined;
                if (testDoc.exists()) {
                     testData = testDoc.data() as MockTest;
                    if (editingItem && docId) {
                        const questionIndex = testData.questions.findIndex(q => q.id === docId);
                        if(questionIndex > -1) {
                            testData.questions[questionIndex] = { ...dataToSave, id: docId };
                        }
                    } else {
                        dataToSave.id = doc(collection(firestore, 'mock-tests')).id;
                        testData.questions = [...(testData.questions || []), dataToSave];
                    }
                }
                const updatedData = { questions: testData?.questions || [] };
                updateDoc(testRef, updatedData).then(() => {
                    toast({ title: "Success", description: "Data saved successfully." });
                    handleCloseForm();
                }).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: testRef.path, operation: 'update', requestResourceData: updatedData,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
                return;
            } else {
                collectionRef = collection(firestore, "mockTests");
                if(!editingItem) {
                    dataToSave.questions = [];
                }
                const category = testCategories.find(c => c.id === dataToSave.categoryId);
                dataToSave.categoryName = category?.title || '';
            }
        }

        const operation: 'update' | 'create' = (editingItem && docId) ? 'update' : 'create';
        let docRef: any;

        if (operation === 'create') {
            if (['blog', 'guidance', 'learn-content', 'test-categories'].includes(activeTab) && docId) {
                docRef = doc(collectionRef, docId);
                if (activeTab === 'test-categories' || activeTab === 'learn-content') {
                    dataToSave.id = docId;
                }
                setDoc(docRef, dataToSave).then(() => {
                    toast({ title: "Success", description: "Data saved successfully." });
                    handleCloseForm();
                }).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path, operation: 'create', requestResourceData: dataToSave,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
            } else {
                addDoc(collectionRef, dataToSave).then(() => {
                    toast({ title: "Success", description: "Data saved successfully." });
                    handleCloseForm();
                }).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: collectionRef.path, operation: 'create', requestResourceData: dataToSave,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
            }
        } else if (operation === 'update' && docId) {
            docRef = doc(collectionRef, docId);
            if (['blog', 'guidance', 'test-categories'].includes(activeTab)) {
                setDoc(docRef, dataToSave).then(() => {
                    toast({ title: "Success", description: "Data saved successfully." });
                    handleCloseForm();
                }).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path, operation: 'update', requestResourceData: dataToSave,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
            } else {
                updateDoc(docRef, dataToSave).then(() => {
                    toast({ title: "Success", description: "Data saved successfully." });
                    handleCloseForm();
                }).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path, operation: 'update', requestResourceData: dataToSave,
                    } satisfies SecurityRuleContext);
                    errorEmitter.emit('permission-error', permissionError);
                });
            }
        }
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettingsFormData({ ...settingsFormData, [name]: value });
    };
    
    const handleSiteSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSiteSettings({ ...siteSettings, [name]: value });
    };
    
    const handlePopupSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPopupSettings({ ...popupSettings, [name]: value });
    };

    const handleSiteSettingsSwitchChange = (checked: boolean) => {
        setSiteSettings({ ...siteSettings, isVisible: checked });
    };

    const handlePopupSwitchChange = (checked: boolean) => {
        setPopupSettings({ ...popupSettings, isVisible: checked });
    };
    
    const handleApprovalChange = (reviewId: string, isApproved: boolean) => {
        if (!firestore) return;
        const reviewRef = doc(firestore, "reviews", reviewId);
        const data = { isApproved };
        updateDoc(reviewRef, data).then(() => {
            setReviews(reviews.map(r => r.id === reviewId ? { ...r, isApproved } : r));
            toast({ title: "Success", description: `Review ${isApproved ? 'approved' : 'unapproved'}.` });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: reviewRef.path, operation: 'update', requestResourceData: data,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    };


    const handleSiteSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        const docRef = doc(firestore, "site_settings", "announcement");
        setDoc(docRef, siteSettings, { merge: true }).then(() => {
            toast({ title: "Success", description: "Site settings updated successfully." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path, operation: 'update', requestResourceData: siteSettings,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const handlePopupSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        const docRef = doc(firestore, "site_settings", "salesPopup");
        setDoc(docRef, popupSettings, { merge: true }).then(() => {
            toast({ title: "Success", description: "Popup settings updated successfully." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path, operation: 'update', requestResourceData: popupSettings,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
    };

    const handleFeatureToggle = (courseId: string, isFeatured: boolean) => {
      if (!firestore) return;
      const courseRef = doc(firestore, 'courses', courseId);
      const data = { isFeatured };
  
      updateDoc(courseRef, data)
        .then(() => {
          setCourses((prevCourses) =>
            prevCourses.map((c) => (c.id === courseId ? { ...c, isFeatured } : c))
          );
          toast({
            title: 'Success',
            description: `Course feature status updated.`,
          });
        })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: courseRef.path,
            operation: 'update',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    };


    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;
        const { currentPassword, newEmail, newPassword, confirmNewPassword } = settingsFormData;

        if (newPassword && newPassword !== confirmNewPassword) {
            toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            toast({ title: "Error", description: "No user is signed in.", variant: "destructive" });
            return;
        }
        
        try {
            // Re-authenticate the user before making sensitive changes
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update email if a new one is provided
            if (newEmail && newEmail !== user.email) {
                await updateEmail(user, newEmail);
                toast({ title: "Success", description: "Email updated successfully." });
            }

            // Update password if a new one is provided
            if (newPassword) {
                await updatePassword(user, newPassword);
                toast({ title: "Success", description: "Password updated successfully." });
            }

            if (!newEmail && !newPassword) {
                 toast({ title: "Info", description: "No changes were submitted." });
            }
            
             setSettingsFormData({
                currentPassword: '',
                newEmail: '',
                newPassword: '',
                confirmNewPassword: ''
            });


        } catch(error: any) {
            let errorMessage = "An error occurred."
             if (error.code) {
                switch (error.code) {
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        errorMessage = 'Incorrect current password.';
                        break;
                     case 'auth/email-already-in-use':
                        errorMessage = 'This email address is already in use by another account.';
                        break;
                    default:
                        errorMessage = 'Failed to update credentials. Please try again.';
                        break;
                }
            }
            console.error("Error updating credentials:", error);
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    };

    const handleUploadAllContent = async () => {
        if (!firestore) {
            toast({ title: "Error", description: "Database not initialized.", variant: "destructive" });
            return;
        }
        if (!confirm("Are you sure you want to upload all learning course content? This will overwrite existing data in the 'learningCourses' collection based on their IDs.")) {
            return;
        }
        
        try {
            const batch = writeBatch(firestore);

            // Upload Learning Courses from courses.json
            for (const course of coursesData) {
                const courseRef = doc(firestore, "learningCourses", course.id);
                const courseDocData = { ...course };
                delete (courseDocData as any).modules;
                batch.set(courseRef, courseDocData);

                for (const module of course.modules) {
                    const moduleRef = doc(firestore, "learningCourses", course.id, "modules", module.id);
                    const moduleDocData = { ...module };
                    delete (moduleDocData as any).lessons;
                    batch.set(moduleRef, moduleDocData);

                    for (const lesson of module.lessons) {
                        const lessonRef = doc(firestore, "learningCourses", course.id, "modules", module.id, "lessons", lesson.id);
                        batch.set(lessonRef, lesson);
                    }
                }
            }

            await batch.commit();
            toast({ title: "Success", description: "All learning course content has been uploaded to Firestore." });

        } catch (error) {
            console.error("Error uploading content:", error);
            toast({ title: "Error", description: "Could not upload content to Firestore.", variant: "destructive" });
        }
    };
    
    const handleGenerateRegNo = async (registrationId: string, studentName: string) => {
        if (!firestore) return;
        setGeneratingRegNo(registrationId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const counterRef = doc(firestore, "counters", "examRegistrations");
                const counterDoc = await transaction.get(counterRef);
                
                let newCount = (counterDoc.data()?.currentNumber || 0) + 1;

                if (!counterDoc.exists()) {
                    transaction.set(counterRef, { currentNumber: newCount });
                } else {
                    transaction.update(counterRef, { currentNumber: newCount });
                }

                const currentYear = new Date().getFullYear();
                const registrationNumber = `MTECH-${currentYear}-${String(newCount).padStart(4, '0')}`;
                
                const regRef = doc(firestore, "examRegistrations", registrationId);
                transaction.update(regRef, { registrationNumber: registrationNumber });

                 setExamRegistrations(prev =>
                    prev.map(reg => 
                        reg.id === registrationId 
                            ? { ...reg, registrationNumber: registrationNumber }
                            : reg
                    )
                );

                toast({
                    title: "Success",
                    description: `Generated Reg. No: ${registrationNumber}`,
                });
            });

            // Send notification after successful transaction
            await fetch('/api/notify-student', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: registrationId,
                title: "Registration Approved!",
                message: `Badhai Ho ${studentName}! Aapka M-Tech IT Institute mein registration approve ho gaya hai.`
              })
            });

        } catch (error) {
            console.error("Failed to generate registration number or send notification:", error);
            toast({
                title: "Error",
                description: "Could not generate registration number. Check console for details.",
                variant: "destructive",
            });
        } finally {
            setGeneratingRegNo(null);
        }
    };

    const getFormTitle = () => {
        const isEditing = !!editingItem;
        if (activeTab === 'courses') return isEditing ? 'Edit Course' : 'Add New Course';
        if (activeTab === 'blog') return isEditing ? 'Edit Blog Post' : 'Add New Blog Post';
        if (activeTab === 'guidance') return isEditing ? 'Edit Guidance Article' : 'Add New Guidance Article';
        if (activeTab === 'resources') return isEditing ? 'Edit Resource' : 'Add New Resource';
        if (activeTab === 'test-categories') return isEditing ? 'Edit Test Category' : 'Add New Test Category';
        if (activeTab === 'mock-tests') {
            if (formParentIds?.testId) return isEditing ? 'Edit Question' : 'Add New Question';
            return isEditing ? 'Edit Mock Test' : 'Add New Mock Test';
        }

        if (activeTab === 'learn-content') {
             if (formParentIds?.courseId) {
                if (formParentIds.moduleId) return isEditing ? 'Edit Lesson' : 'Add New Lesson';
                return isEditing ? 'Edit Module' : 'Add New Module';
            }
            return isEditing ? 'Edit Learning Course' : 'Add New Learning Course';
        }
        return 'Edit Item';
    }


    const renderFormFields = () => {
        let currentActiveTab = activeTab;
        if (activeTab === 'learn-content') {
            if (formParentIds?.courseId) {
                currentActiveTab = formParentIds.moduleId ? 'learningLesson' : 'learningModule';
            } else {
                currentActiveTab = 'learningCourse';
            }
        }
        if (activeTab === 'mock-tests') {
            if(formParentIds?.testId) {
                currentActiveTab = 'testQuestion';
            } else {
                currentActiveTab = 'mockTest';
            }
        }
        if (activeTab === 'test-categories') {
            currentActiveTab = 'testCategory';
        }

        switch(currentActiveTab) {
            case 'courses': return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="actualPrice">Actual Price</Label>
                            <Input id="actualPrice" name="actualPrice" value={formData.actualPrice || ''} onChange={handleFormChange} placeholder="e.g., 5000" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="discountPrice">Discount Price</Label>
                            <Input id="discountPrice" name="discountPrice" value={formData.discountPrice || ''} onChange={handleFormChange} placeholder="e.g., 3500" required/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" name="duration" value={formData.duration || ''} onChange={handleFormChange} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="eligibility">Eligibility</Label>
                            <Input id="eligibility" name="eligibility" value={formData.eligibility || ''} onChange={handleFormChange} placeholder="e.g., 10th Pass"/>
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="syllabus">Syllabus (comma-separated)</Label>
                        <Textarea id="syllabus" name="syllabus" value={Array.isArray(formData.syllabus) ? formData.syllabus.join(', ') : ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input id="image" name="image" value={formData.image || ''} onChange={handleFormChange} placeholder="https://example.com/image.jpg"/>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="isFeatured" name="isFeatured" checked={formData.isFeatured || false} onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})} />
                        <Label htmlFor="isFeatured">Feature on Homepage</Label>
                    </div>
                </>
            );
            case 'blog':
            case 'guidance':
                const isGuidance = activeTab === 'guidance';
                return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" name="author" value={formData.author || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" value={formData.category || ''} onChange={handleFormChange} disabled={isGuidance} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input id="image" name="image" value={formData.image || ''} onChange={handleFormChange} placeholder="https://example.com/image.jpg"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content (HTML)</Label>
                        <Textarea id="content" name="content" value={formData.content || ''} onChange={handleFormChange} rows={10} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" name="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={handleFormChange} />
                    </div>
                </>
            );
            case 'resources': return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleFormChange} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="type">Type (PDF, Worksheet, Quiz)</Label>
                        <Input id="type" name="type" value={formData.type || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fileUrl">File URL</Label>
                        <Input id="fileUrl" name="fileUrl" value={formData.fileUrl || ''} onChange={handleFormChange} placeholder="https://drive.google.com/file/d/..."/>
                    </div>
                </>
            );
             case 'learningCourse': return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="id">Course ID (Slug)</Label>
                        <Input id="id" name="id" value={formData.id || ''} onChange={handleFormChange} disabled={!!editingItem} placeholder="e.g., html-basics"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="level">Level</Label>
                        <Select name="level" value={formData.level || ''} onValueChange={(val) => setFormData({ ...formData, level: val })}>
                             <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Beginner to Advanced">Beginner to Advanced</SelectItem>
                             </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="order">Order</Label>
                        <Input id="order" name="order" type="number" value={formData.order || 0} onChange={handleFormChange} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="icon">Icon (Emoji)</Label>
                        <Input id="icon" name="icon" value={formData.icon || ''} onChange={handleFormChange} placeholder="e.g., 📄"/>
                    </div>
                </>
            );
            case 'learningModule': return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="id">Module ID (Slug)</Label>
                        <Input id="id" name="id" value={formData.id || ''} onChange={handleFormChange} disabled={!!editingItem} placeholder="e.g., introduction"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select name="difficulty" value={formData.difficulty || ''} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
                             <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                             </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="order">Order</Label>
                        <Input id="order" name="order" type="number" value={formData.order || 0} onChange={handleFormChange} />
                    </div>
                </>
            );
            case 'learningLesson': return (
                 <>
                    <div className="grid gap-2">
                        <Label htmlFor="id">Lesson ID (Slug)</Label>
                        <Input id="id" name="id" value={formData.id || ''} onChange={handleFormChange} disabled={!!editingItem} placeholder="e.g., what-is-html"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="order">Order</Label>
                        <Input id="order" name="order" type="number" value={formData.order || 0} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content (HTML Supported)</Label>
                        <Textarea id="content" name="content" value={formData.content || ''} onChange={handleFormChange} rows={10} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="exampleCode">Example Code (Optional)</Label>
                        <Textarea id="exampleCode" name="exampleCode" value={formData.exampleCode || ''} onChange={handleFormChange} rows={6} />
                    </div>
                </>
            );
             case 'testCategory': return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="id">Category ID (Slug)</Label>
                        <Input id="id" name="id" value={formData.id || ''} onChange={handleFormChange} disabled={!!editingItem} placeholder="e.g., ms-word"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="icon">Icon (Emoji)</Label>
                        <Input id="icon" name="icon" value={formData.icon || ''} onChange={handleFormChange} placeholder="e.g., 📄"/>
                    </div>
                </>
            );
            case 'mockTest': return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Test Title</Label>
                        <Input id="title" name="title" value={formData.title || ''} onChange={handleFormChange} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="categoryId">Category</Label>
                        <Select name="categoryId" value={formData.categoryId || ''} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                             <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                             <SelectContent>
                                {testCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                                ))}
                             </SelectContent>
                        </Select>
                    </div>
                    {formData.categoryId === 'student-exam' && (
                        <div className="grid gap-2">
                            <Label htmlFor="assignedCourse">Assign to Course (for Student Exams)</Label>
                             <Select name="assignedCourse" value={formData.assignedCourse || ''} onValueChange={(val) => setFormData({ ...formData, assignedCourse: val })}>
                                <SelectTrigger><SelectValue placeholder="Select course for this exam" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleFormChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Duration (Minutes)</Label>
                            <Input id="duration" name="duration" type="number" value={formData.duration || 0} onChange={handleFormChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="totalMarks">Total Marks</Label>
                            <Input id="totalMarks" name="totalMarks" type="number" value={formData.totalMarks || 0} onChange={handleFormChange} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="isPublished" name="isPublished" checked={formData.isPublished || false} onCheckedChange={(checked) => setFormData({...formData, isPublished: checked})} />
                        <Label htmlFor="isPublished">Publish Test</Label>
                    </div>
                </>
            );
            case 'testQuestion': return (
                 <>
                    <div className="grid gap-2">
                        <Label htmlFor="questionText">Question Text</Label>
                        <Textarea id="questionText" name="questionText" value={formData.questionText || ''} onChange={handleFormChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                           <Label htmlFor="option-0">Option A</Label>
                           <Input id="option-0" name="option-0" value={formData.options?.[0] || ''} onChange={handleFormChange} />
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="option-1">Option B</Label>
                           <Input id="option-1" name="option-1" value={formData.options?.[1] || ''} onChange={handleFormChange} />
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="option-2">Option C</Label>
                           <Input id="option-2" name="option-2" value={formData.options?.[2] || ''} onChange={handleFormChange} />
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="option-3">Option D</Label>
                           <Input id="option-3" name="option-3" value={formData.options?.[3] || ''} onChange={handleFormChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="correctOption">Correct Option</Label>
                            <Select name="correctOption" value={String(formData.correctOption) || '0'} onValueChange={(val) => setFormData({ ...formData, correctOption: Number(val) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Option A</SelectItem>
                                    <SelectItem value="1">Option B</SelectItem>
                                    <SelectItem value="2">Option C</SelectItem>
                                    <SelectItem value="3">Option D</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="marks">Marks</Label>
                            <Input id="marks" name="marks" type="number" value={formData.marks || 1} onChange={handleFormChange} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="explanation">Explanation (Optional)</Label>
                        <Textarea id="explanation" name="explanation" value={formData.explanation || ''} onChange={handleFormChange} />
                    </div>
                </>
            );
            default: return null;
        }
    }


    const unreadEnrollments = enrollments.filter(e => !e.isRead).length;
    const unreadRegistrations = examRegistrations.filter(r => !r.isRead).length;


    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                    <Logo />
                    <div className="ml-auto">
                        <Button variant="outline" size="icon" onClick={() => auth && signOut(auth)}>
                           <LogOut className="h-4 w-4" />
                           <span className="sr-only">Logout</span>
                        </Button>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <Tabs defaultValue="dashboard" onValueChange={(value) => setActiveTab(value as string)}>
                        <div className="flex items-center">
                            <ScrollArea className="w-full whitespace-nowrap">
                                <TabsList className="inline-flex">
                                    <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4"/>Dashboard</TabsTrigger>
                                    <TabsTrigger value="courses">Courses</TabsTrigger>
                                    <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                                    <TabsTrigger value="guidance"><Briefcase className="mr-2 h-4 w-4"/>Career Guidance</TabsTrigger>
                                    <TabsTrigger value="resources">Resources</TabsTrigger>
                                    <TabsTrigger value="learn-content">Learn Content</TabsTrigger>
                                    <TabsTrigger value="test-categories"><BookCopy className="mr-2 h-4 w-4"/>Test Categories</TabsTrigger>
                                    <TabsTrigger value="mock-tests"><ListTodo className="mr-2 h-4 w-4" />Mock Tests</TabsTrigger>
                                    <TabsTrigger value="reviews"><Star className="mr-2 h-4 w-4" />Reviews</TabsTrigger>
                                    <TabsTrigger value="exam-registrations" className="relative">
                                        <UserCheck className="mr-2 h-4 w-4"/>Exam Registrations
                                        {unreadRegistrations > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{unreadRegistrations}</Badge>}
                                    </TabsTrigger>
                                    <TabsTrigger value="exam-results"><FileText className="mr-2 h-4 w-4"/>Exam Results</TabsTrigger>
                                    <TabsTrigger value="certificates"><Award className="mr-2 h-4 w-4" />Certificates</TabsTrigger>
                                    <TabsTrigger value="internal-links"><Link2 className="mr-2 h-4 w-4"/>Internal Links</TabsTrigger>
                                    <TabsTrigger value="enrollments" className="relative">
                                        <FileText className="mr-2 h-4 w-4"/>Enrollments
                                        {unreadEnrollments > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{unreadEnrollments}</Badge>}
                                    </TabsTrigger>
                                    <TabsTrigger value="contacts"><MessageSquare className="mr-2 h-4 w-4"/>Contacts</TabsTrigger>
                                    <TabsTrigger value="data-management"><Database className="mr-2 h-4 w-4"/>Data Management</TabsTrigger>
                                    <TabsTrigger value="site-settings"><Megaphone className="mr-2 h-4 w-4"/>Announcements</TabsTrigger>
                                    <TabsTrigger value="popup-settings"><Tv className="mr-2 h-4 w-4"/>Popup</TabsTrigger>
                                    <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4"/>Settings</TabsTrigger>
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                             <div className="ml-auto flex items-center gap-2 pl-4">
                                {activeTab !== 'dashboard' && activeTab !== 'settings' && activeTab !== 'site-settings' && activeTab !== 'popup-settings' && activeTab !== 'enrollments' && activeTab !== 'contacts' && activeTab !== 'internal-links' && activeTab !== 'reviews' && activeTab !== 'exam-registrations' && activeTab !== 'exam-results' && activeTab !== 'certificates' && activeTab !== 'data-management' && (
                                <Button size="sm" className="h-8 gap-1" onClick={() => handleAddNew()}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Add New
                                    </span>
                                </Button>
                                )}
                            </div>
                        </div>
                        <TabsContent value="dashboard">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Registered Students</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{registrationStats.total}</div>
                                        <p className="text-xs text-muted-foreground">Total students who have registered for exams.</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="mt-8">
                                <Card>
                                     <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/> Course-wise Enrollment</CardTitle>
                                        <CardDescription>Breakdown of students registered in each course.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Course Name</TableHead>
                                                    <TableHead className="text-right">Number of Students</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.entries(registrationStats.byCourse).sort(([, a], [, b]) => b - a).map(([course, count]) => (
                                                    <TableRow key={course}>
                                                        <TableCell className="font-medium">{course}</TableCell>
                                                        <TableCell className="text-right font-bold">{count}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="courses">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Courses</CardTitle>
                                    <CardDescription>
                                        Manage your institute's courses. Enable the "Featured" toggle to show a course on the homepage.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading courses...</p> :
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="hidden sm:table-cell">Image</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Featured</TableHead>
                                                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {courses.map(course => (
                                                    <TableRow key={course.id}>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <img alt="Course image" className="aspect-square rounded-md object-cover" height="64" src={course.image} width="64"/>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{course.title}</TableCell>
                                                        <TableCell>{course.discountPrice}</TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={course.isFeatured}
                                                                onCheckedChange={(checked) => handleFeatureToggle(course.id, checked)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">{course.duration}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleEdit(course)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('courses', course.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="blog">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Blog Posts</CardTitle>
                                    <CardDescription>
                                        Manage your blog articles.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {loading ? <p>Loading blog posts...</p> :
                                     <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {blogPosts.map(post => (
                                                    <TableRow key={post.slug}>
                                                        <TableCell className="font-medium">{post.title}</TableCell>
                                                        <TableCell className="hidden sm:table-cell">{post.author}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{post.date}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                     <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleEdit(post)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('blog', post.slug)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                     </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="guidance">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Career Guidance Articles</CardTitle>
                                    <CardDescription>
                                        Manage your career guidance content.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {loading ? <p>Loading articles...</p> :
                                     <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {guidanceArticles.map(post => (
                                                    <TableRow key={post.slug}>
                                                        <TableCell className="font-medium">{post.title}</TableCell>
                                                        <TableCell className="hidden sm:table-cell">{post.author}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{post.date}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                     <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleEdit(post)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('guidance', post.slug)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                         <ScrollBar orientation="horizontal" />
                                     </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="resources">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resources</CardTitle>
                                    <CardDescription>
                                        Manage your student resources.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {loading ? <p>Loading resources...</p> :
                                     <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {resources.map(resource => (
                                                    <TableRow key={resource.id}>
                                                        <TableCell className="font-medium">{resource.title}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{resource.type}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                     <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleEdit(resource)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('resources', resource.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                         <ScrollBar orientation="horizontal" />
                                     </ScrollArea>
                                     }
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="learn-content">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Learning Content</CardTitle>
                                    <CardDescription>Manage interactive course modules, chapters, and lessons.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading content...</p> : (
                                        <div className="space-y-4">
                                            <Accordion type="multiple" className="w-full">
                                                {learningCourses.map(course => (
                                                    <AccordionItem value={course.id} key={course.id}>
                                                        <div className="flex items-center pr-4 hover:bg-muted/50 rounded-lg">
                                                            <AccordionTrigger className="flex-1 px-4 py-2 hover:no-underline">
                                                                 <div className="flex items-center gap-4">
                                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                                    <span className="font-semibold text-lg">{course.title}</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <div className="flex items-center gap-2 pl-2">
                                                                <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); handleEdit(course)}}><Edit className="h-4 w-4 mr-1"/> Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={(e) => {e.stopPropagation(); openConfirmationDialog('learningCourse', course.id)}}><Trash className="h-4 w-4 mr-1"/> Delete</Button>
                                                            </div>
                                                        </div>
                                                        <AccordionContent className="pl-6 border-l ml-3">
                                                            <div className="space-y-2 py-2">
                                                                {course.modules.map(module => (
                                                                     <Accordion type="multiple" key={module.id}>
                                                                        <AccordionItem value={module.id}>
                                                                             <div className="flex items-center pr-4 hover:bg-muted/50 rounded-lg">
                                                                                <AccordionTrigger className="flex-1 px-4 py-2 hover:no-underline">
                                                                                     <div className="flex items-center gap-3">
                                                                                         <Layers className="h-5 w-5 text-accent" />
                                                                                        <span>{module.title}</span>
                                                                                    </div>
                                                                                </AccordionTrigger>
                                                                                <div className="flex items-center gap-2 pl-2">
                                                                                    <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); handleEdit(module, { courseId: course.id })}}><Edit className="h-4 w-4 mr-1"/> Edit</Button>
                                                                                    <Button variant="destructive" size="sm" onClick={(e) => {e.stopPropagation(); openConfirmationDialog('learningModule', module.id, { courseId: course.id })}}><Trash className="h-4 w-4 mr-1"/> Delete</Button>
                                                                                </div>
                                                                             </div>
                                                                            <AccordionContent className="pl-6 border-l ml-3">
                                                                                <div className="space-y-1 py-2">
                                                                                {module.lessons.map(lesson => (
                                                                                    <div key={lesson.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                                                                                        <span>{lesson.title}</span>
                                                                                         <div className="flex items-center gap-2">
                                                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(lesson, { courseId: course.id, moduleId: module.id })}><Edit className="h-4 w-4"/></Button>
                                                                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openConfirmationDialog('learningLesson', lesson.id, { courseId: course.id, moduleId: module.id })}><Trash className="h-4 w-4"/></Button>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleAddNew({ courseId: course.id, moduleId: module.id })}>
                                                                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Lesson
                                                                                </Button>
                                                                                </div>
                                                                            </AccordionContent>
                                                                        </AccordionItem>
                                                                     </Accordion>
                                                                ))}
                                                                 <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAddNew({ courseId: course.id })}>
                                                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Module
                                                                </Button>
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="test-categories">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Test Categories</CardTitle>
                                    <CardDescription>Manage the categories for your mock tests. Create a category called "Student Exam" for registered student exams.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading categories...</p> :
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>ID (Slug)</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {testCategories.map(category => (
                                                    <TableRow key={category.id}>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                           {category.icon && <span className="text-xl">{category.icon}</span>}
                                                           {category.title}
                                                        </TableCell>
                                                        <TableCell>{category.id}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEdit(category)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('testCategory', category.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="mock-tests">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mock Tests</CardTitle>
                                    <CardDescription>Create and manage mock tests. Assign tests to the "Student Exam" category to make them visible only to registered students.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading mock tests...</p> : (
                                        <Accordion type="multiple" className="w-full">
                                            {mockTests.map(test => (
                                                <AccordionItem value={test.id} key={test.id}>
                                                    <div className="flex items-center pr-4 hover:bg-muted/50 rounded-lg">
                                                        <AccordionTrigger className="flex-1 px-4 py-2 hover:no-underline">
                                                            <div className="flex items-center justify-between w-full">
                                                                <div>
                                                                  <span className="font-semibold text-lg">{test.title}</span>
                                                                  <Badge variant="outline" className="ml-2">{test.categoryName || 'Uncategorized'}</Badge>
                                                                  {test.assignedCourse && <Badge variant="secondary" className="ml-2">{test.assignedCourse}</Badge>}
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <span>{test.questions?.length || 0} Questions</span>
                                                                    <span>{test.duration} mins</span>
                                                                    <Badge variant={test.isPublished ? "default" : "secondary"}>
                                                                        {test.isPublished ? "Published" : "Draft"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <div className="flex items-center gap-2 pl-2">
                                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(test) }}><Edit className="h-4 w-4 mr-1" /> Edit Test</Button>
                                                            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); openConfirmationDialog('mockTest', test.id) }}><Trash className="h-4 w-4 mr-1" /> Delete Test</Button>
                                                        </div>
                                                    </div>
                                                    <AccordionContent className="pl-6 border-l-2 ml-3">
                                                        <div className="py-4">
                                                            <h4 className="font-semibold mb-4">Questions</h4>
                                                            <div className="space-y-2">
                                                                {test.questions?.map((q, index) => (
                                                                    <div key={q.id} className="flex justify-between items-center p-3 rounded-md border bg-card">
                                                                        <p className="flex-1 truncate">{index + 1}. {q.questionText}</p>
                                                                        <div className="flex items-center gap-2 ml-4">
                                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(q, { testId: test.id })}><Edit className="h-4 w-4" /></Button>
                                                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openConfirmationDialog('testQuestion', q.id, { testId: test.id })}><Trash className="h-4 w-4" /></Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(!test.questions || test.questions.length === 0) && (
                                                                    <p className="text-muted-foreground text-sm text-center py-4">No questions added to this test yet.</p>
                                                                )}
                                                            </div>
                                                             <Button variant="secondary" size="sm" className="mt-4" onClick={() => handleAddNew({ testId: test.id })}>
                                                                <PlusCircle className="h-4 w-4 mr-2" /> Add Question
                                                            </Button>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="reviews">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Reviews</CardTitle>
                                    <CardDescription>Manage and approve student testimonials. Approved reviews will appear on the site.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading reviews...</p> :
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Rating</TableHead>
                                                    <TableHead>Comment</TableHead>
                                                    <TableHead className="hidden md:table-cell">Submitted</TableHead>
                                                    <TableHead>Approved</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reviews.map(review => (
                                                    <TableRow key={review.id}>
                                                        <TableCell className="font-medium">{review.name}</TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <div className="flex items-center">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] sm:max-w-xs truncate">{review.comment}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{review.submittedAt}</TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={review.isApproved}
                                                                onCheckedChange={(checked) => handleApprovalChange(review.id, checked)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openConfirmationDialog('reviews', review.id)}>
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="exam-registrations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Exam Registrations</CardTitle>
                                    <CardDescription>View and manage student registrations for official exams.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading registrations...</p> :
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Reg. No</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Course</TableHead>
                                                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                                                    <TableHead className="hidden md:table-cell">Registered</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {examRegistrations.map(reg => (
                                                    <TableRow key={reg.id} onClick={() => !reg.isRead && handleMarkAsRead('examRegistrations', reg.id)} className={cn(!reg.isRead && "bg-blue-50 hover:bg-blue-100/80")}>
                                                        <TableCell className="font-mono">{reg.registrationNumber || 'Not Assigned'}</TableCell>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                            {!reg.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>}
                                                            {reg.fullName}
                                                        </TableCell>
                                                        <TableCell>{reg.course}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{reg.phone}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{reg.registeredAt}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                     {!reg.registrationNumber && (
                                                                        <DropdownMenuItem onClick={() => handleGenerateRegNo(reg.id, reg.fullName)} disabled={generatingRegNo === reg.id}>
                                                                            {generatingRegNo === reg.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                                                                            Generate Reg. No
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('examRegistration', reg.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="exam-results">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Exam Results</CardTitle>
                                    <CardDescription>View results from registration-based exams.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading results...</p> :
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Reg. No</TableHead>
                                                    <TableHead>Student Name</TableHead>
                                                    <TableHead>Test Name</TableHead>
                                                    <TableHead>Score</TableHead>
                                                    <TableHead>Submitted</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {examResults.map(res => (
                                                    <TableRow key={res.id}>
                                                        <TableCell className="font-mono">{res.registrationNumber}</TableCell>
                                                        <TableCell className="font-medium">{res.studentName}</TableCell>
                                                        <TableCell>{res.testName}</TableCell>
                                                        <TableCell>{res.score}/{res.totalMarks}</TableCell>
                                                        <TableCell>{res.submittedAt}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                     <DropdownMenuItem onClick={() => router.push(`/exam/result/${res.id}`)}>
                                                                        <FileText className="mr-2 h-4 w-4" /> View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('examResult', res.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="certificates">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Issued Certificates</CardTitle>
                                    <CardDescription>View and manage all auto-generated student certificates.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <p>Loading certificates...</p> : (
                                        <ScrollArea className="w-full whitespace-nowrap">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Certificate ID</TableHead>
                                                        <TableHead>Student Name</TableHead>
                                                        <TableHead>Course</TableHead>
                                                        <TableHead>Issued On</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {certificates.map(cert => (
                                                        <TableRow key={cert.id}>
                                                            <TableCell className="font-mono">{cert.certificateId}</TableCell>
                                                            <TableCell>{cert.studentName}</TableCell>
                                                            <TableCell>{cert.courseName}</TableCell>
                                                            <TableCell>{cert.issueDate}</TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem asChild>
                                                                            <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                                                                                <FileText className="mr-2 h-4 w-4" /> View/Download
                                                                            </a>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('certificate', cert.id)}>
                                                                            <Trash className="mr-2 h-4 w-4" />Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                             </Table>
                                            <ScrollBar orientation="horizontal" />
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="internal-links">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Manage Internal Links</CardTitle>
                                    <CardDescription>Create internal links between your blog posts to improve SEO and user navigation.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleInternalLinkSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div className="grid gap-2">
                                            <Label htmlFor="sourcePost">Source Post (Where to add the link)</Label>
                                            <Select value={selectedSourcePost} onValueChange={setSelectedSourcePost}>
                                                <SelectTrigger id="sourcePost"><SelectValue placeholder="Select a post" /></SelectTrigger>
                                                <SelectContent>
                                                    {allBlogPostsForLinks.map(post => <SelectItem key={post.slug} value={post.slug}>{post.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="targetPost">Target Post (Which post to link to)</Label>
                                            <Select value={selectedTargetPost} onValueChange={setSelectedTargetPost}>
                                                <SelectTrigger id="targetPost"><SelectValue placeholder="Select a post" /></SelectTrigger>
                                                <SelectContent>
                                                    {allBlogPostsForLinks.map(post => <SelectItem key={post.slug} value={post.slug}>{post.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="linkKeyword">Keyword to Link</Label>
                                            <Input id="linkKeyword" value={linkKeyword} onChange={e => setLinkKeyword(e.target.value)} placeholder="e.g., typing practice" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Button type="submit" disabled={isLinkSaving}>{isLinkSaving ? 'Saving...' : 'Add Internal Link'}</Button>
                                        </div>
                                    </form>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold mb-4">Existing Internal Links</h3>
                                        <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="space-y-4">
                                            {allBlogPostsForLinks.filter(p => p.internalLinks && p.internalLinks.length > 0).map(post => (
                                                <div key={post.slug}>
                                                    <h4 className="font-semibold">{post.title}</h4>
                                                    <Table>
                                                        <TableHeader>
                                                           <TableRow>
                                                                <TableHead>Keyword</TableHead>
                                                                <TableHead>Links To</TableHead>
                                                                <TableHead className="text-right">Action</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {post.internalLinks?.map(link => (
                                                                <TableRow key={`${post.slug}-${link.keyword}`}>
                                                                    <TableCell>"{link.keyword}"</TableCell>
                                                                    <TableCell>{link.title}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openLinkDeleteDialog(post.slug, link)}>
                                                                            <Trash className="h-4 w-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                        </ScrollArea>
                                    </div>
                                </CardContent>
                             </Card>
                         </TabsContent>
                         <TabsContent value="enrollments">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enrollment Submissions</CardTitle>
                                    <CardDescription>
                                        View and manage course enrollment applications.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {loading ? <p>Loading enrollments...</p> :
                                     <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                                                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                                                    <TableHead>Submitted At</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {enrollments.map(enrollment => (
                                                    <TableRow key={enrollment.id} onClick={() => !enrollment.isRead && handleMarkAsRead('enrollments', enrollment.id)} className={cn(!enrollment.isRead && "bg-blue-50 hover:bg-blue-100/80")}>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                          {!enrollment.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>}
                                                          {enrollment.name}
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">{enrollment.email}</TableCell>
                                                         <TableCell className="hidden md:table-cell">{enrollment.phone}</TableCell>
                                                        <TableCell>{enrollment.submittedAt}</TableCell>
                                                        <TableCell className="text-right">
                                                             <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                     <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('enrollments', enrollment.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                     }
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="contacts">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Submissions</CardTitle>
                                    <CardDescription>
                                        View and manage messages from the contact form.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {loading ? <p>Loading messages...</p> :
                                     <ScrollArea className="w-full whitespace-nowrap">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                                                    <TableHead>Message</TableHead>
                                                    <TableHead className="hidden md:table-cell">Submitted At</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {contacts.map(contact => (
                                                    <TableRow key={contact.id}>
                                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                                        <TableCell className="hidden sm:table-cell">{contact.email}</TableCell>
                                                        <TableCell className="max-w-[200px] sm:max-w-xs truncate">{contact.message}</TableCell>
                                                        <TableCell className="hidden md:table-cell">{contact.submittedAt}</TableCell>
                                                        <TableCell className="text-right">
                                                             <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                     <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('contacts', contact.id)}>
                                                                        <Trash className="mr-2 h-4 w-4" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                         <ScrollBar orientation="horizontal" />
                                     </ScrollArea>
                                     }
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="data-management">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Management</CardTitle>
                                    <CardDescription>
                                        Use these tools to manage your site's static content.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-w-md">
                                        <div className="rounded-lg border p-4">
                                            <h3 className="font-semibold">Upload All Learning Content</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                This will upload content from your local `courses.json` file to the "learningCourses" collection in Firestore. This will overwrite any existing courses with the same IDs.
                                            </p>
                                            <Button onClick={handleUploadAllContent} variant="outline" className="mt-4">
                                                <Upload className="mr-2 h-4 w-4"/> Upload Learning Content
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="site-settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Announcement Bar</CardTitle>
                                    <CardDescription>Manage the announcement bar that appears at the top of your site.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSiteSettingsSubmit} className="space-y-6 max-w-lg">
                                        <div className="grid gap-2">
                                            <Label htmlFor="announcementText">Announcement Text</Label>
                                            <Textarea id="announcementText" name="text" value={siteSettings.text} onChange={handleSiteSettingsChange} placeholder="E.g., ✨ New batches starting soon! 20% off on all courses." />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="announcementLink">Link (Optional)</Label>
                                            <Input id="announcementLink" name="link" value={siteSettings.link} onChange={handleSiteSettingsChange} placeholder="/courses" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch id="announcementVisibility" name="isVisible" checked={siteSettings.isVisible} onCheckedChange={handleSiteSettingsSwitchChange} />
                                            <Label htmlFor="announcementVisibility">Show Announcement Bar</Label>
                                        </div>

                                        <Button type="submit">Save Settings</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="popup-settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sales & Event Popup</CardTitle>
                                    <CardDescription>Manage the promotional popup on the homepage. It appears once per session for visitors.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePopupSettingsSubmit} className="space-y-6 max-w-lg">
                                        <div className="grid gap-2">
                                            <Label htmlFor="popupTitle">Popup Title</Label>
                                            <Input id="popupTitle" name="title" value={popupSettings.title} onChange={handlePopupSettingsChange} placeholder="e.g., Black Friday Sale!" />
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="popupDescription">Description</Label>
                                            <Textarea id="popupDescription" name="description" value={popupSettings.description} onChange={handlePopupSettingsChange} placeholder="Get 50% off on all courses. Limited time offer!" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="popupImageUrl">Background Image URL</Label>
                                            <Input id="popupImageUrl" name="imageUrl" value={popupSettings.imageUrl} onChange={handlePopupSettingsChange} placeholder="https://example.com/sale-image.png" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="popupCtaText">Button Text</Label>
                                            <Input id="popupCtaText" name="ctaText" value={popupSettings.ctaText} onChange={handlePopupSettingsChange} placeholder="e.g., View Courses" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="popupCtaLink">Button Link</Label>
                                            <Input id="popupCtaLink" name="ctaLink" value={popupSettings.ctaLink} onChange={handlePopupSettingsChange} placeholder="e.g., /courses" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch id="popupVisibility" name="isVisible" checked={popupSettings.isVisible} onCheckedChange={handlePopupSwitchChange} />
                                            <Label htmlFor="popupVisibility">Show Popup on Homepage</Label>
                                        </div>
                                        <Button type="submit">Save Popup Settings</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Settings</CardTitle>
                                    <CardDescription>Update your administrator credentials. Note: Phone number cannot be changed.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSettingsSubmit} className="space-y-4 max-w-md">
                                        <div className="grid gap-2">
                                            <Label htmlFor="newEmail">Admin Email</Label>
                                            <Input id="newEmail" name="newEmail" type="email" placeholder="new.admin@example.com" value={settingsFormData.newEmail} onChange={handleSettingsChange}/>
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input id="currentPassword" name="currentPassword" type="password" required value={settingsFormData.currentPassword} onChange={handleSettingsChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input id="newPassword" name="newPassword" type="password" placeholder="Leave blank to keep current password" value={settingsFormData.newPassword} onChange={handleSettingsChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                            <Input id="confirmNewPassword" name="confirmNewPassword" type="password" value={settingsFormData.confirmNewPassword} onChange={handleSettingsChange}/>
                                        </div>
                                        <Button type="submit">Update Settings</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this item and all its sub-items (modules, lessons, or questions).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
                <DialogContent className="sm:max-w-[425px] md:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{getFormTitle()}</DialogTitle>
                        <DialogDescription>
                           {editingItem ? `Make changes to your item here.` : `Add a new item to your site.`} Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 py-4">
                           {renderFormFields()}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}


    

    




    