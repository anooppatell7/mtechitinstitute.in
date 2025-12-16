

"use server";

import { z } from "zod";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export type ContactFormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function submitContactForm(
  prevState: ContactFormState,
  data: FormData
): Promise<ContactFormState> {
  const formData = Object.fromEntries(data);
  const parsed = contactFormSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return {
      message: "Invalid form data.",
      fields: formData as Record<string, string>,
      issues,
    };
  }
    
  if (!db) {
    return { message: "Database not initialized. Please try again later." };
  }

  try {
    const contactData = {
        ...parsed.data,
        submittedAt: serverTimestamp(),
    };
    await addDoc(collection(db, "contacts"), contactData);

    return { message: "Thank you for your message! We will get back to you soon." };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { message: "An error occurred. Please try again later." };
  }
}

const enrollmentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  message: z.string().optional(),
});

export type EnrollmentFormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  isSuccess?: boolean;
};

export async function submitEnrollmentForm(
  prevState: EnrollmentFormState,
  data: FormData
): Promise<EnrollmentFormState> {
  const formData = Object.fromEntries(data);
  const parsed = enrollmentFormSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return {
      message: "Invalid form data. Please check the fields and try again.",
      fields: formData as Record<string, string>,
      issues,
      isSuccess: false,
    };
  }

  if (!db) {
    return { 
        message: "Database not initialized. Please try again later or contact us directly on WhatsApp.",
        isSuccess: false,
    };
  }

  try {
    const enrollmentData = {
      ...parsed.data,
      submittedAt: serverTimestamp(),
      isRead: false,
    };
    await addDoc(collection(db, "enrollments"), enrollmentData);
    
    return { 
        message: "Thank you for your application! We have received your details and will contact you shortly.",
        isSuccess: true,
    };

  } catch (error) {
    console.error("Error submitting enrollment form:", error);
    return { 
        message: "Something went wrong on our end. Please try again later or contact us directly on WhatsApp.",
        isSuccess: false,
    };
  }
}


const reviewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, { message: "Review must be at least 10 characters." }),
});

export type ReviewFormState = {
  message: string;
  issues?: string[];
  isSuccess?: boolean;
};

export async function submitReviewForm(
  prevState: ReviewFormState,
  data: FormData
): Promise<ReviewFormState> {
  const formData = Object.fromEntries(data);
  const parsed = reviewFormSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return {
      message: "Invalid data. Please check your input.",
      issues,
      isSuccess: false,
    };
  }

  if (!db) {
    return {
      message: "Database not initialized. Please try again later.",
      isSuccess: false,
    }
  }
  
  try {
    const reviewData = {
      ...parsed.data,
      isApproved: false, // Reviews require approval
      submittedAt: serverTimestamp(),
    };
    await addDoc(collection(db, "reviews"), reviewData);

    return {
      message: "Thank you for your review! It has been submitted for approval.",
      isSuccess: true,
    };
  } catch(error) {
    console.error("Error submitting review:", error);
    return {
      message: "An error occurred while submitting your review. Please try again.",
      isSuccess: false,
    }
  }
}
