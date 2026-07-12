// src/types/index.ts
// Central type definitions mapped 1:1 to Firestore collections.
// Keep these in sync with your Firestore schema.

import { Timestamp } from "firebase/firestore";

export type FireTimestamp = Timestamp | null;

/** users collection (also holds students, role: "admin" | "student" | "trainer") */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "student" | "trainer" | string;
  status: "active" | "inactive" | string;
  gender?: string;
  dateOfBirth?: string;
  profileImage?: string;
  emailVerified?: boolean;
  course?: string;
  rollNo?: string;
  className?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** courses collection */
export interface Course {
  id: string;
  title: string;
  category: string;
  technology?: string;
  trainerName?: string;
  duration?: string;
  level?: string;
  mode?: string;
  price: number;
  discountPrice?: number;
  status: "active" | "draft" | "inactive" | string;
  featured?: boolean;
  certificate?: boolean;
  courseImage?: string;
  description?: string;
  totalStudents?: number;
  totalAssignments?: number;
  totalProjects?: number;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** enrollments collection */
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  batch?: string;
  enrollmentDate?: FireTimestamp;
  paymentStatus: "paid" | "pending" | "failed" | string;
  completionStatus: "ongoing" | "completed" | string;
  progress?: number;
  status: "active" | "pending" | "completed" | string;
  certificateIssued?: boolean;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** projects collection (Final Year Projects) */
export interface Project {
  id: string;
  title: string;
  description?: string;
  domain?: string;
  technology?: string[];
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  guide?: string;
  price: number;
  projectType?: string;
  status: "available" | "sold" | "unavailable" | string;
  featured?: boolean;
  sourceCode?: boolean;
  documentation?: boolean;
  pptIncluded?: boolean;
  reportIncluded?: boolean;
  totalSold?: number;
  projectImage?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** assignments collection */
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  dueDate?: FireTimestamp;
  totalMarks?: number;
  status: "active" | "draft" | "closed" | string;
  attachment?: string;
  createdBy?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** submissions collection - student assignment submissions */
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  status: "pending" | "submitted" | "graded" | string;
  submittedAt?: FireTimestamp;
  attachmentUrl?: string;
  marks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: FireTimestamp;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** payments collection */
export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId?: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | string;
  transactionId?: string;
  receiptNumber?: string;
  paymentDate?: FireTimestamp;
  remarks?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** certificates collection */
export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId?: string;
  certificateNumber: string;
  issueDate?: FireTimestamp;
  status: "issued" | "pending" | string;
  certificateUrl?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** messages collection */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "in_progress" | "resolved" | string;
  replied?: boolean;
  repliedAt?: FireTimestamp;
  repliedBy?: string;
  replyMessage?: string;
  userId?: string;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** announcements collection */
export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: "general" | "course" | "event" | "maintenance" | string;
  status: "draft" | "published" | "archived" | string;
  pinned: boolean;
  publishedAt?: FireTimestamp;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
  createdBy?: string;
  targetAudience?: "all" | "students" | "instructors" | "admins" | string;
  imageUrl?: string;
  link?: string;
  expiresAt?: FireTimestamp;
}

/** chat threads collection (student conversations) */
export interface ChatThread {
  id: string;
  studentId: string;
  participantName: string;
  participantRole: string;
  participantId?: string;
  lastMessage: string;
  lastMessageAt?: FireTimestamp;
  unreadCount: number;
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** chat messages subcollection inside chat threads */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt?: FireTimestamp;
  readAt?: FireTimestamp;
}

/* ---------------------------------------------------------------------
 * The following are NOT part of the original collections —
 * they back the Analytics / Reports / Website Content / Users & Roles
 * pages, which need somewhere real to read/write. Adjust freely to match
 * however you'd rather structure them.
 * ------------------------------------------------------------------- */

/** reports collection — a log of previously generated reports */
export interface ReportRecord {
  id: string;
  type: "students" | "revenue" | "enrollments" | "courses" | "certificates" | string;
  dateFrom?: FireTimestamp;
  dateTo?: FireTimestamp;
  recordCount: number;
  generatedBy?: string;
  createdAt?: FireTimestamp;
}

/** roles collection — permission matrix per role name */
export interface RoleDefinition {
  id: string; // role key, e.g. "admin", "trainer", "support"
  label: string;
  permissions: {
    manageStudents: boolean;
    manageCourses: boolean;
    managePayments: boolean;
    manageContent: boolean;
    manageUsers: boolean;
  };
  createdAt?: FireTimestamp;
  updatedAt?: FireTimestamp;
}

/** websiteContent/home doc — public site hero + announcement content */
export interface WebsiteHomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  announcementText: string;
  announcementActive: boolean;
  updatedAt?: FireTimestamp;
}

/** testimonials collection */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  avatarUrl?: string;
  rating?: number;
  published: boolean;
  createdAt?: FireTimestamp;
}

/** faqs collection */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
  published: boolean;
  createdAt?: FireTimestamp;
}