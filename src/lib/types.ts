

import type { HowTo, FAQPage } from 'schema-dts';

export type InternalLink = {
  keyword: string;
  url: string;
  title: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  actualPrice?: string;
  discountPrice: string; // Formerly 'fees'
  syllabus: string[];
  image: string;
  eligibility?: string;
  isFeatured?: boolean;
};

export type BlogPost = {
  slug: string;
  title:string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  content: string;
  summary?: string;
  internalLinks?: InternalLink[];
  schemaType?: 'Article' | 'HowTo' | 'FAQ'; // To potentially override auto-detection
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: "PDF" | "Worksheet" | "Quiz";
  fileUrl: string;
};

export type NavItem = {
  title: string;
  href: string;
  auth?: boolean;
  registeredOnly?: boolean;
  hideWhenRegistered?: boolean;
};

export type Enrollment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
};

export type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    message: string;
    submittedAt: string;
}

export type Review = {
    id: string;
    name: string;
    rating: number;
    comment: string;
    submittedAt: string;
    isApproved: boolean;
}

export type SiteSettings = {
    id: 'announcement';
    text: string;
    link: string;
    isVisible: boolean;
}

export type PopupSettings = {
    id: 'salesPopup';
    isVisible: boolean;
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
};


export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // index of the correct option
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  content: string; // HTML content for theory
  exampleCode?: string;
  practiceTask?: string;
  quiz?: QuizQuestion[];
};

export type LearningModule = {
  id: string;
  order: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
};

export type LearningCourse = {
  id: string;
  order: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced';
  icon?: string;
  modules: LearningModule[];
};

export type UserProgress = {
    [courseId: string]: {
        completedLessons: string[];
        lastVisitedLesson?: string;
    };
};

// Types for Mock Test System
export type TestCategory = {
    id: string; // This will be the slug
    title: string;
    description: string;
    icon: string; // e.g., an emoji or a lucide-icon name
};

export type TestQuestion = {
    id: string;
    questionText: string;
    options: string[]; // Array of 4 strings
    correctOption: number; // Index of the correct option (0-3)
    explanation?: string;
    marks: number;
};

export type MockTest = {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    totalMarks: number;
    questions: TestQuestion[];
    isPublished: boolean;
    categoryId: string;
    categoryName: string;
    assignedCourse?: string; // To link student exams to a specific course
};

export type TestResponse = {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
    marksAwarded: number;
};

export type TestResult = {
    id: string;
    userId: string;
    userName: string;
    testId: string;
    testTitle: string;
    score: number;
    totalMarks: number;
    accuracy: number; // percentage
    timeTaken: number; // in seconds
    responses: TestResponse[];
    submittedAt: any; // Firestore Timestamp
};

export type ExamRegistration = {
  id: string; // Should be user.uid
  registrationNumber?: string; // Optional now
  fullName: string;
  fatherName: string;
  phone: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  course: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  registeredAt: any; // Firestore Timestamp
  isRead: boolean;
  onesignal_player_id?: string;
};

export type ExamResult = {
  id: string;
  userId: string; // IMPORTANT: For security rules
  registrationNumber: string;
  studentName: string;
  testId: string;
  testName: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number; // in seconds
  responses: TestResponse[];
  submittedAt: any; // Firestore Timestamp
  certificateId?: string; // Stored, unique certificate ID
};

export type Certificate = {
    id: string; // Auto-generated
    certificateId: string; // Human-readable ID e.g., CERT-2025-0001
    studentName: string;
    registrationNumber: string;
    courseName: string;
    score: number;
    totalMarks: number;
    percentage: number;
    examDate: string; // The date the exam was submitted
    issueDate: string; // The date the certificate was generated
    certificateUrl: string; // URL to the PDF in Firebase Storage
    examResultId: string; // Link back to the specific exam result
}


// Add types for more complex schemas
export type HowToSchema = HowTo;
export type FAQPageSchema = FAQPage;

    