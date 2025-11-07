
"use client";

import Link from "next/link";
import React, { useState, useEffect, use } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { PlusCircle, MoreHorizontal, LogOut, Trash, Edit, Settings, FileText, MessageSquare, Briefcase, Link2, Megaphone, Star, Upload, BookOpen, Layers, ChevronDown } from "lucide-react";
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
import type { Course, BlogPost, Resource, Enrollment, ContactSubmission, InternalLink, SiteSettings, Review, LearningCourse, LearningModule, Lesson } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, Timestamp, where, arrayUnion, arrayRemove, getDoc, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { signOut, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import coursesData from "@/lib/data/courses.json";
import marketingCoursesData from "@/lib/data/marketing-courses.json";


type ItemType = 'courses' | 'blog' | 'guidance' | 'resources' | 'settings' | 'enrollments' | 'contacts' | 'internal-links' | 'site-settings' | 'reviews' | 'learningCourse' | 'learningModule' | 'learningLesson';

export default function AdminDashboardPage() {
    const [user, authLoading, authError] = useAuthState(auth);
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [learningCourses, setLearningCourses] = useState<LearningCourse[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [guidanceArticles, setGuidanceArticles] = useState<BlogPost[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Site settings state
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({ id: 'announcement', text: '', link: '', isVisible: false });

    // Internal linking state
    const [allBlogPostsForLinks, setAllBlogPostsForLinks] = useState<BlogPost[]>([]);
    const [selectedSourcePost, setSelectedSourcePost] = useState<string>("");
    const [selectedTargetPost, setSelectedTargetPost] = useState<string>("");
    const [linkKeyword, setLinkKeyword] = useState<string>("");
    const [isLinkSaving, setIsLinkSaving] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait until auth state is loaded
        if (!user) {
            router.push('/login'); // Redirect if not logged in
        } else {
            fetchData();
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        if (!db) return;
        setLoading(true);
        try {
            // Courses
            const coursesCollection = collection(db, "courses");
            const courseSnapshot = await getDocs(coursesCollection);
            const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(courseList);

             // Learning Courses
            const learningCoursesQuery = query(collection(db, "learningCourses"), orderBy("order"));
            const learningCoursesSnapshot = await getDocs(learningCoursesQuery);
            const learningCoursesList = await Promise.all(learningCoursesSnapshot.docs.map(async (courseDoc) => {
                const courseData = { id: courseDoc.id, ...courseDoc.data() } as LearningCourse;
                
                const modulesQuery = query(collection(db, "learningCourses", courseDoc.id, "modules"), orderBy("order"));
                const modulesSnapshot = await getDocs(modulesQuery);
                
                courseData.modules = await Promise.all(modulesSnapshot.docs.map(async (moduleDoc) => {
                    const moduleData = { id: moduleDoc.id, ...moduleDoc.data() } as LearningModule;

                    const lessonsQuery = query(collection(db, "learningCourses", courseDoc.id, "modules", moduleDoc.id, "lessons"), orderBy("order"));
                    const lessonsSnapshot = await getDocs(lessonsQuery);
                    moduleData.lessons = lessonsSnapshot.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
                    
                    return moduleData;
                }));

                return courseData;
            }));
            setLearningCourses(learningCoursesList);

            // Blog Posts
            const blogQuery = query(collection(db, "blog"), orderBy("date", "desc"));
            const blogSnapshot = await getDocs(blogQuery);
            const allPosts = blogSnapshot.docs.map(doc => ({ ...doc.data(), slug: doc.id } as BlogPost));
            
            setAllBlogPostsForLinks(allPosts); // For internal linking dropdowns
            setBlogPosts(allPosts.filter(post => post.category !== "Career Guidance"));
            setGuidanceArticles(allPosts.filter(post => post.category === "Career Guidance"));

            // Resources
            const resourcesCollection = collection(db, "resources");
            const resourceSnapshot = await getDocs(resourcesCollection);
            const resourceList = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
            setResources(resourceList);

            // Enrollments
            const enrollmentsQuery = query(collection(db, "enrollments"), orderBy("submittedAt", "desc"));
            const enrollmentSnapshot = await getDocs(enrollmentsQuery);
            const enrollmentList = enrollmentSnapshot.docs.map(doc => {
              const data = doc.data();
              const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
              return { id: doc.id, ...data, submittedAt } as Enrollment;
            });
            setEnrollments(enrollmentList);
            
            // Contacts
            const contactsQuery = query(collection(db, "contacts"), orderBy("submittedAt", "desc"));
            const contactSnapshot = await getDocs(contactsQuery);
            const contactList = contactSnapshot.docs.map(doc => {
              const data = doc.data();
              const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
              return { id: doc.id, ...data, submittedAt } as ContactSubmission;
            });
            setContacts(contactList);

            // Reviews
            const reviewsQuery = query(collection(db, "reviews"), orderBy("submittedAt", "desc"));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const reviewList = reviewsSnapshot.docs.map(doc => {
                const data = doc.data();
                const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleString() || new Date().toLocaleString();
                return { id: doc.id, ...data, submittedAt } as Review;
            });
            setReviews(reviewList);

            // Site Settings
            const announcementDoc = await getDoc(doc(db, "site_settings", "announcement"));
            if (announcementDoc.exists()) {
                setSiteSettings(announcementDoc.data() as SiteSettings);
            }

        } catch (error) {
            console.error("Error fetching data: ", error);
             toast({ title: "Error", description: "Could not fetch data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{type: ItemType, id: string, parentIds?: { courseId: string, moduleId?: string }} | null>(null);
    const [linkToDelete, setLinkToDelete] = useState<{postSlug: string, link: InternalLink} | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Course | BlogPost | Resource | LearningCourse | LearningModule | Lesson | null>(null);
    const [formParentIds, setFormParentIds] = useState<{ courseId: string, moduleId?: string } | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [activeTab, setActiveTab] = useState<string>('courses');
    
    const [settingsFormData, setSettingsFormData] = useState({
        currentPassword: '',
        newEmail: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const openConfirmationDialog = (type: ItemType, id: string, parentIds?: { courseId: string, moduleId?: string }) => {
        setItemToDelete({ type, id, parentIds });
        setDialogOpen(true);
    };

    const openLinkDeleteDialog = (postSlug: string, link: InternalLink) => {
        setLinkToDelete({ postSlug, link });
        setDialogOpen(true);
    }


    const handleDelete = async () => {
        if (!db) return;
        if (itemToDelete) {
            const { type, id, parentIds } = itemToDelete;
            try {
                if (type === 'courses') await deleteDoc(doc(db, "courses", id));
                if (type === 'blog' || type === 'guidance') await deleteDoc(doc(db, "blog", id));
                if (type === 'resources') await deleteDoc(doc(db, "resources", id));
                if (type === 'enrollments') await deleteDoc(doc(db, "enrollments", id));
                if (type === 'contacts') await deleteDoc(doc(db, "contacts", id));
                if (type === 'reviews') await deleteDoc(doc(db, "reviews", id));
                if (type === 'learningCourse') await deleteDoc(doc(db, "learningCourses", id));
                if (type === 'learningModule' && parentIds?.courseId) await deleteDoc(doc(db, "learningCourses", parentIds.courseId, "modules", id));
                if (type === 'learningLesson' && parentIds?.courseId && parentIds?.moduleId) await deleteDoc(doc(db, "learningCourses", parentIds.courseId, "modules", parentIds.moduleId, "lessons", id));
                await fetchData(); // Refetch all data
                toast({ title: "Success", description: "Item deleted successfully." });
            } catch (error) {
                console.error("Error deleting document: ", error);
                 toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
            }
            setItemToDelete(null);
        } else if (linkToDelete) {
             const { postSlug, link } = linkToDelete;
            try {
                const postRef = doc(db, "blog", postSlug);
                await updateDoc(postRef, {
                    internalLinks: arrayRemove(link)
                });
                await fetchData(); // Refetch all data
                toast({ title: "Success", description: "Internal link removed." });
            } catch (error) {
                 console.error("Error deleting internal link: ", error);
                 toast({ title: "Error", description: "Could not remove link.", variant: "destructive" });
            }
            setLinkToDelete(null);
        }

        setDialogOpen(false);
    };
    
    const handleAddNew = (parentIds: { courseId: string, moduleId?: string } | null = null) => {
        setEditingItem(null);
        let initialData: any = {};
        if (activeTab === 'guidance') {
            initialData = { category: "Career Guidance" };
        }
        if (activeTab === 'learn-content' && parentIds) {
            setFormParentIds(parentIds);
        } else {
            setFormParentIds(null);
        }
        setFormData(initialData);
        setIsFormOpen(true);
    };

    const handleEdit = (item: any, parentIds: { courseId: string, moduleId?: string } | null = null) => {
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
        const { name, value } = e.target;
        if (name === 'tags' || name === 'syllabus') {
            setFormData({ ...formData, [name]: value.split(',').map(s => s.trim()) });
        } else if (name === 'order') {
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
        if (!db) return;
        if (!selectedSourcePost || !selectedTargetPost || !linkKeyword) {
            toast({ title: "Error", description: "Please fill all fields for internal linking.", variant: "destructive" });
            return;
        }
        if (selectedSourcePost === selectedTargetPost) {
            toast({ title: "Error", description: "Source and Target post cannot be the same.", variant: "destructive" });
            return;
        }

        setIsLinkSaving(true);
        try {
            const targetPost = allBlogPostsForLinks.find(p => p.slug === selectedTargetPost);
            if (!targetPost) throw new Error("Target post not found");

            const newLink: InternalLink = {
                keyword: linkKeyword,
                url: `/blog/${targetPost.slug}`,
                title: targetPost.title,
            };

            const sourcePostRef = doc(db, "blog", selectedSourcePost);
            await updateDoc(sourcePostRef, {
                internalLinks: arrayUnion(newLink)
            });

            await fetchData();
            toast({ title: "Success", description: "Internal link added successfully." });
            setSelectedSourcePost("");
            setSelectedTargetPost("");
            setLinkKeyword("");

        } catch (error) {
            console.error("Error adding internal link: ", error);
            toast({ title: "Error", description: "Could not add internal link.", variant: "destructive" });
        } finally {
            setIsLinkSaving(false);
        }
    };


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db) return;
        
        try {
            let collectionRef: any;
            let dataToSave = { ...formData };
            let docId: string | undefined = (editingItem as any)?.id;
            
            // Cleanup data before saving
            delete dataToSave.id;
            if ('modules' in dataToSave) delete dataToSave.modules;
            if ('lessons' in dataToSave) delete dataToSave.lessons;
            
            // Determine collection path and data based on active tab and context
            if (activeTab === 'courses') {
                collectionRef = collection(db, "courses");
                dataToSave.image = dataToSave.image || `https://picsum.photos/seed/${dataToSave.title || 'course'}/600/400`;
                dataToSave.actualPrice = String(dataToSave.actualPrice || '');
                dataToSave.discountPrice = String(dataToSave.discountPrice || '');
            } else if (activeTab === 'blog' || activeTab === 'guidance') {
                collectionRef = collection(db, "blog");
                docId = (editingItem as BlogPost)?.slug;
                if (!docId) { // For new posts
                    docId = createSlug(dataToSave.title);
                    if (!docId) throw new Error("Blog post must have a title to generate a slug.");
                    dataToSave.internalLinks = []; // Initialize for new posts
                }
                dataToSave.image = dataToSave.image || `https://picsum.photos/seed/${dataToSave.title || 'blog'}/800/450`;
            } else if (activeTab === 'resources') {
                collectionRef = collection(db, "resources");
                if (dataToSave.fileUrl) {
                    dataToSave.fileUrl = convertToDirectDownloadLink(dataToSave.fileUrl);
                }
            } else if (activeTab === 'learn-content') {
                 if (formParentIds) { // Editing/Adding Module or Lesson
                    if (formParentIds.moduleId) { // Lesson
                        collectionRef = collection(db, "learningCourses", formParentIds.courseId, "modules", formParentIds.moduleId, "lessons");
                    } else { // Module
                        collectionRef = collection(db, "learningCourses", formParentIds.courseId, "modules");
                    }
                } else { // Course
                    collectionRef = collection(db, "learningCourses");
                }
            }

            // Perform DB operation
            if (editingItem && docId) {
                if(activeTab === 'blog' || activeTab === 'guidance' || (activeTab === 'learn-content' && !formParentIds)) {
                     await setDoc(doc(collectionRef, docId), dataToSave);
                } else {
                     await updateDoc(doc(collectionRef, docId), dataToSave);
                }
            } else {
                 if(activeTab === 'blog' || activeTab === 'guidance' || activeTab === 'learn-content') {
                    docId = dataToSave.id || createSlug(dataToSave.title);
                    if (!docId) throw new Error("Slug/ID could not be created for new item.");
                    await setDoc(doc(collectionRef, docId), dataToSave);
                 } else {
                    await addDoc(collectionRef, dataToSave);
                 }
            }
            
            await fetchData();
            toast({ title: "Success", description: "Data saved successfully." });
            handleCloseForm();
        } catch(error) {
            console.error("Error saving document: ", error);
             toast({ title: "Error", description: "Could not save data.", variant: "destructive" });
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

    const handleSiteSettingsSwitchChange = (checked: boolean) => {
        setSiteSettings({ ...siteSettings, isVisible: checked });
    };
    
    const handleApprovalChange = async (reviewId: string, isApproved: boolean) => {
        if (!db) return;
        try {
            const reviewRef = doc(db, "reviews", reviewId);
            await updateDoc(reviewRef, { isApproved });
            setReviews(reviews.map(r => r.id === reviewId ? { ...r, isApproved } : r));
            toast({ title: "Success", description: `Review ${isApproved ? 'approved' : 'unapproved'}.` });
        } catch (error) {
            console.error("Error updating review status:", error);
            toast({ title: "Error", description: "Could not update review status.", variant: "destructive" });
        }
    };


    const handleSiteSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db) return;
        try {
            await setDoc(doc(db, "site_settings", "announcement"), siteSettings, { merge: true });
            toast({ title: "Success", description: "Site settings updated successfully." });
        } catch (error) {
            console.error("Error updating site settings:", error);
            toast({ title: "Error", description: "Could not update site settings.", variant: "destructive" });
        }
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

    const handleUploadLearnContent = async () => {
        if (!db) {
            toast({ title: "Error", description: "Database not initialized.", variant: "destructive" });
            return;
        }
        if (!confirm("Are you sure you want to upload all static content to Firestore? This will overwrite existing courses with the same IDs.")) {
            return;
        }
        
        try {
            const batch = writeBatch(db);

            // Upload Learning Courses
            for (const course of coursesData) {
                const courseRef = doc(db, "learningCourses", course.id);
                const courseDocData = { ...course };
                delete (courseDocData as any).modules;
                batch.set(courseRef, courseDocData);

                for (const module of course.modules) {
                    const moduleRef = doc(collection(courseRef, "modules"), module.id);
                     const moduleDocData = { ...module };
                     delete (moduleDocData as any).lessons;
                    batch.set(moduleRef, moduleDocData);

                    for (const lesson of module.lessons) {
                        const lessonRef = doc(collection(moduleRef, "lessons"), lesson.id);
                        batch.set(lessonRef, lesson);
                    }
                }
            }
            
            // Upload Marketing Courses
            for (const course of marketingCoursesData) {
                // Use addDoc to get an auto-generated ID from Firestore
                const courseRef = doc(collection(db, "courses"));
                batch.set(courseRef, course);
            }

            await batch.commit();
            toast({ title: "Success", description: "All static course content uploaded to Firestore." });
            await fetchData(); // Refresh data in the dashboard

        } catch (error) {
            console.error("Error uploading learning content:", error);
            toast({ title: "Error", description: "Could not upload content.", variant: "destructive" });
        }
    };

    const getFormTitle = () => {
        const isEditing = !!editingItem;
        if (activeTab === 'courses') return isEditing ? 'Edit Course' : 'Add New Course';
        if (activeTab === 'blog') return isEditing ? 'Edit Blog Post' : 'Add New Blog Post';
        if (activeTab === 'guidance') return isEditing ? 'Edit Guidance Article' : 'Add New Guidance Article';
        if (activeTab === 'resources') return isEditing ? 'Edit Resource' : 'Add New Resource';

        if (activeTab === 'learn-content') {
             if (formParentIds) {
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
            if (formParentIds) {
                currentActiveTab = formParentIds.moduleId ? 'learningLesson' : 'learningModule';
            } else {
                currentActiveTab = 'learningCourse';
            }
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
            default: return null;
        }
    }


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
                    <Tabs defaultValue="courses" onValueChange={(value) => setActiveTab(value as string)}>
                        <div className="flex items-center">
                            <ScrollArea className="w-full whitespace-nowrap">
                                <TabsList className="inline-flex">
                                    <TabsTrigger value="courses">Courses</TabsTrigger>
                                    <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                                    <TabsTrigger value="guidance"><Briefcase className="mr-2 h-4 w-4"/>Career Guidance</TabsTrigger>
                                    <TabsTrigger value="resources">Resources</TabsTrigger>
                                    <TabsTrigger value="learn-content">Learn Content</TabsTrigger>
                                    <TabsTrigger value="reviews"><Star className="mr-2 h-4 w-4" />Reviews</TabsTrigger>
                                    <TabsTrigger value="internal-links"><Link2 className="mr-2 h-4 w-4"/>Internal Links</TabsTrigger>
                                    <TabsTrigger value="enrollments"><FileText className="mr-2 h-4 w-4"/>Enrollments</TabsTrigger>
                                    <TabsTrigger value="contacts"><MessageSquare className="mr-2 h-4 w-4"/>Contacts</TabsTrigger>
                                    <TabsTrigger value="site-settings"><Megaphone className="mr-2 h-4 w-4"/>Site Settings</TabsTrigger>
                                    <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4"/>Settings</TabsTrigger>
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                             <div className="ml-auto flex items-center gap-2 pl-4">
                                {activeTab !== 'settings' && activeTab !== 'site-settings' && activeTab !== 'enrollments' && activeTab !== 'contacts' && activeTab !== 'internal-links' && activeTab !== 'reviews' && (
                                <Button size="sm" className="h-8 gap-1" onClick={() => handleAddNew()}>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Add New
                                    </span>
                                </Button>
                                )}
                            </div>
                        </div>
                        <TabsContent value="courses">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Courses</CardTitle>
                                    <CardDescription>
                                        Manage your institute's courses.
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
                                                    <TableRow key={enrollment.id}>
                                                        <TableCell className="font-medium">{enrollment.name}</TableCell>
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
                        <TabsContent value="site-settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Site Settings</CardTitle>
                                    <CardDescription>Manage global settings for your website, like the announcement bar.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSiteSettingsSubmit} className="space-y-6 max-w-lg">
                                        <div>
                                            <h3 className="text-lg font-medium">Announcement Bar</h3>
                                            <p className="text-sm text-muted-foreground">This bar will appear at the top of your site.</p>
                                        </div>
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

                                        <Button type="submit">Save Site Settings</Button>
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
                            This action cannot be undone. This will permanently delete this item and all its sub-items (modules, lessons).
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


    

    

    

    