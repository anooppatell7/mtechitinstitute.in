
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
};

export type Enrollment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
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

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation?: string;
};

export type Lesson = {
  slug: string;
  title: string;
  order: number;
  theory: string; // HTML content
  codeExample?: string;
  practiceTasks?: string[];
  quiz?: QuizQuestion[];
};

export type Chapter = {
  slug: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

export type LearningModule = {
  slug: string;
  title: string;
  order: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  chapters: Chapter[];
  icon: string;
};


// Add types for more complex schemas
export type HowToSchema = HowTo;
export type FAQPageSchema = FAQPage;
