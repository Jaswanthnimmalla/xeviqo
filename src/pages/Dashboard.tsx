// src/pages/Dashboard.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { where, onSnapshot, collection, query } from "firebase/firestore";
import {
  Users,
  BookOpen,
  GraduationCap,
  Wallet,
  FolderKanban,
  Award,
  MessageSquare,
  ArrowRight,
  CreditCard,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3
} from "lucide-react";

import { db } from "../firebase/firebase";
import { formatCurrency, formatDate, timeAgo } from "../lib/format";
import type { AppUser, Course, Enrollment, Payment, Certificate, ContactMessage, Project } from "../types";

// ============================================
// 📊 STAT CARD - Compact center aligned
// ============================================
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}> = ({ label, value, icon: Icon, color, loading, onClick }) => {
  const colorMap = {
    violet: "border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
    blue: "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
    amber: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    pink: "border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400",
    cyan: "border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    emerald: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rose: "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };

  const styles = colorMap[color as keyof typeof colorMap] || colorMap.violet;

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-[#1E293B] rounded-2xl border-2 ${styles} p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Icon */}
        <div className={`h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-xl ${styles} flex items-center justify-center border-2 mb-1.5`}>
          <Icon className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5" />
        </div>
        
        {/* Value */}
        <div>
          {loading ? (
            <div className="h-6 xs:h-7 sm:h-8 w-16 xs:w-20 sm:w-24 mx-auto bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
          ) : (
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
        
        {/* Label */}
        <p className="text-[9px] xs:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 truncate max-w-full">
          {label}
        </p>
      </div>
    </div>
  );
};

// ============================================
// 📊 REVENUE CHART
// ============================================
const RevenueChart: React.FC<{ data: { label: string; revenue: number }[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const hasData = data.some(d => d.revenue > 0);

  if (!hasData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <BarChart3 className="h-12 w-12 mb-2 opacity-30" />
        <p className="text-sm">No revenue data available</p>
        <p className="text-xs">Payments will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex h-[85%] items-end gap-1 sm:gap-2">
        {data.map((d, i) => {
          const height = (d.revenue / maxRevenue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full">
                <div 
                  className="w-full rounded-t-md bg-gradient-to-t from-[#6C63FF] to-[#8B5CF6] transition-all duration-500 hover:opacity-80"
                  style={{ height: `${Math.max(height, 4)}px`, minHeight: '4px' }}
                />
                {d.revenue > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 dark:bg-slate-700 text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                    {formatCurrency(d.revenue)}
                  </div>
                )}
              </div>
              <span className="text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// 🏷️ STATUS BADGE
// ============================================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusClassMap: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30",
    completed: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200 border-sky-200 dark:border-sky-500/30",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200 dark:border-amber-500/30",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border-red-200 dark:border-red-500/30",
    issued: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200 border-violet-200 dark:border-violet-500/30",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border-red-200 dark:border-red-500/30",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30",
    refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200 dark:border-blue-500/30",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200 dark:border-amber-500/30",
  };
  
  const badgeClass = statusClassMap[status] ?? "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200 border-slate-200 dark:border-slate-600";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${badgeClass}`}>
      {status ? status.replace(/_/g, ' ').replace(/^[a-z]/, (c) => c.toUpperCase()) : "Unknown"}
    </span>
  );
};

// ============================================
// 🏠 DASHBOARD MAIN COMPONENT
// ============================================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // State for real-time data
  const [students, setStudents] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Real-time listener for students
  useEffect(() => {
    try {
      const studentsRef = collection(db, "users");
      const q = query(studentsRef, where("role", "in", ["student", "user"]));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[];
        setStudents(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching students:", err);
      setLoading(false);
    }
  }, []);

  // ✅ Real-time listener for courses
  useEffect(() => {
    try {
      const coursesRef = collection(db, "courses");
      const unsubscribe = onSnapshot(coursesRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
        setCourses(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  }, []);

  // ✅ Real-time listener for enrollments
  useEffect(() => {
    try {
      const enrollmentsRef = collection(db, "enrollments");
      const unsubscribe = onSnapshot(enrollmentsRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrollment[];
        setEnrollments(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  }, []);

  // ✅ Real-time listener for payments
  useEffect(() => {
    try {
      const paymentsRef = collection(db, "payments");
      const unsubscribe = onSnapshot(paymentsRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
        setPayments(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  }, []);

  // ✅ Real-time listener for certificates
  useEffect(() => {
    try {
      const certificatesRef = collection(db, "certificates");
      const unsubscribe = onSnapshot(certificatesRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Certificate[];
        setCertificates(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  }, []);

  // ✅ Real-time listener for projects
  useEffect(() => {
    try {
      const projectsRef = collection(db, "projects");
      const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        setProjects(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  // ✅ Real-time listener for messages
  useEffect(() => {
    try {
      const messagesRef = collection(db, "messages");
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactMessage[];
        setMessages(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    courses.forEach(c => map[c.id] = c);
    return map;
  }, [courses]);

  const studentMap = useMemo(() => {
    const map: Record<string, AppUser> = {};
    students.forEach(s => map[s.id] = s);
    return map;
  }, [students]);

  const totalRevenue = useMemo(
    () => payments.filter(p => p.paymentStatus === "paid" || p.paymentStatus === "approved").reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );

  const pendingPayments = useMemo(
    () => payments.filter(p => p.paymentStatus === "pending").length,
    [payments]
  );

  const projectsSold = useMemo(
    () => projects.reduce((sum, p) => sum + (p.totalSold || 0), 0),
    [projects]
  );

  const certificatesIssued = useMemo(
    () => certificates.filter(c => c.status === "issued").length,
    [certificates]
  );

  const recentEnrollments = useMemo(
    () => [...enrollments].sort((a, b) => (b.enrollmentDate?.toMillis?.() ?? 0) - (a.enrollmentDate?.toMillis?.() ?? 0)).slice(0, 5),
    [enrollments]
  );

  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => (b.paymentDate?.toMillis?.() ?? 0) - (a.paymentDate?.toMillis?.() ?? 0)).slice(0, 5),
    [payments]
  );

  const recentMessages = useMemo(
    () => [...messages].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)).slice(0, 5),
    [messages]
  );

  const topCourses = useMemo(
    () => [...courses].sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0)).slice(0, 4),
    [courses]
  );

  const revenueTrend = useMemo(() => {
    const days: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const dayTotal = payments
        .filter(p => {
          if ((p.paymentStatus !== "paid" && p.paymentStatus !== "approved") || !p.paymentDate) return false;
          // ✅ FIX: Handle both Timestamp and Date
          let pd;
          if (p.paymentDate && typeof p.paymentDate === 'object' && 'toDate' in p.paymentDate) {
            pd = p.paymentDate.toDate();
          } else if (p.paymentDate) {
            pd = new Date(p.paymentDate);
          } else {
            return false;
          }
          return pd.getDate() === d.getDate() && pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      days.push({ label, revenue: dayTotal });
    }
    return days;
  }, [payments]);

  // Stats for footer
  const activeStudents = students.filter(s => s.status === "active").length;
  const activeCourses = courses.filter(c => c.status === "active").length;
  const pendingCertificates = certificates.filter(c => c.status === "pending").length;
  const unreadMessages = messages.filter(m => m.status === "unread").length;

  // Loading state with skeleton animation
  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
              <div className="flex items-center gap-2 xs:gap-3">
                <div className="p-2 xs:p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 h-10 w-10 xs:h-12 xs:w-12 animate-shimmer" />
                <div>
                  <div className="h-6 xs:h-7 sm:h-8 w-40 xs:w-48 sm:w-56 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-3 xs:h-4 w-48 xs:w-56 sm:w-64 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded mt-1 bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
              <div className="h-6 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>

          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 xs:gap-3 sm:gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1E293B] rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-3.5 shadow-sm">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-6 xs:h-7 sm:h-8 w-16 xs:w-20 sm:w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded mt-1.5 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-2.5 w-16 xs:w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded mt-1 bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <div className="h-5 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
                <div className="h-4 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
              </div>
              <div className="h-48 xs:h-56 sm:h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <div className="h-5 w-40 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
                <div className="h-4 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
                      <div className="h-3 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded mt-1 bg-[length:200%_100%] animate-shimmer" />
                    </div>
                    <div className="h-5 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded bg-[length:200%_100%] animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-2 xs:p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
        
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-2 xs:p-2.5 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white shadow-lg shadow-[#6C63FF]/20">
                <Sparkles className="h-5 w-5 xs:h-6 xs:w-6" />
              </div>
              <div>
                <h1 className="text-base xs:text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome back, Admin! 👋
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Here's what's happening with Xeviqo today.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-3 w-3" />
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* STAT CARDS - Compact center aligned */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 xs:gap-3 sm:gap-4">
          <StatCard 
            label="Total Students" 
            value={students.length} 
            icon={Users} 
            color="violet" 
            loading={loading}
            onClick={() => navigate('/admin/students')}
          />
          <StatCard 
            label="Total Courses" 
            value={courses.length} 
            icon={BookOpen} 
            color="blue" 
            loading={loading}
            onClick={() => navigate('/admin/courses')}
          />
          <StatCard 
            label="Enrollments" 
            value={enrollments.length} 
            icon={GraduationCap} 
            color="green" 
            loading={loading}
            onClick={() => navigate('/admin/enrollments')}
          />
          <StatCard 
            label="Revenue" 
            value={formatCurrency(totalRevenue)} 
            icon={Wallet} 
            color="amber" 
            loading={loading}
            onClick={() => navigate('/admin/payments')}
          />
          <StatCard 
            label="Pending Payments" 
            value={pendingPayments} 
            icon={CreditCard} 
            color="rose" 
            loading={loading}
            onClick={() => navigate('/admin/approve-payments')}
          />
          <StatCard 
            label="Projects Sold" 
            value={projectsSold} 
            icon={FolderKanban} 
            color="pink" 
            loading={loading}
            onClick={() => navigate('/admin/final-year-projects')}
          />
          <StatCard 
            label="Certificates" 
            value={certificatesIssued} 
            icon={Award} 
            color="cyan" 
            loading={loading}
            onClick={() => navigate('/admin/certificates')}
          />
        </div>

        {/* ============================================ */}
        {/* CHART + RECENT ENROLLMENTS - Fixed names */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#6C63FF]" />
                Revenue — Last 7 Days
              </h2>
              <span className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Total: {formatCurrency(revenueTrend.reduce((sum, d) => sum + d.revenue, 0))}
              </span>
            </div>
            <div className="h-48 xs:h-56 sm:h-64 w-full">
              <RevenueChart data={revenueTrend} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#6C63FF]" />
                Recent Enrollments
              </h2>
              <button
                onClick={() => navigate('/admin/enrollments')}
                className="text-[10px] xs:text-xs text-[#6C63FF] hover:text-[#5b53e6] flex items-center gap-1 font-medium whitespace-nowrap"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-3">
                  <GraduationCap className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No enrollments yet</p>
              </div>
            ) : (
              <div className="space-y-3 xs:space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {recentEnrollments.map((e) => {
                  const student = studentMap[e.studentId];
                  const course = courseMap[e.courseId];
                  
                  // ✅ FIX: Use proper fallback values
                  const displayName = student?.name || "Unknown Student";
                  const displayCourse = course?.title || e.courseId || "Unknown Course";
                  
                  return (
                    <div key={e.id} className="flex items-center justify-between gap-2 xs:gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate">
                          {displayCourse}
                        </p>
                      </div>
                      <StatusBadge status={e.status || 'active'} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* TOP COURSES + PAYMENTS + MESSAGES - Fixed names */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#6C63FF]" />
                Top Courses
              </h2>
              <button
                onClick={() => navigate('/admin/courses')}
                className="text-[10px] xs:text-xs text-[#6C63FF] hover:text-[#5b53e6] flex items-center gap-1 font-medium whitespace-nowrap"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {topCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-3">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No courses yet</p>
              </div>
            ) : (
              <div className="space-y-3 xs:space-y-4">
                {topCourses.map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-2 xs:gap-3">
                    <span className="flex h-5 w-5 xs:h-6 xs:w-6 shrink-0 items-center justify-center rounded-full bg-[#6C63FF]/10 text-[#6C63FF] text-[10px] xs:text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {c.title}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] transition-all duration-500"
                          style={{
                            width: `${Math.min(100, ((c.totalStudents || 0) / (topCourses[0]?.totalStudents || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      {c.totalStudents || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Payments - Fixed Names */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#6C63FF]" />
                Latest Payments
              </h2>
              <button
                onClick={() => navigate('/admin/payments')}
                className="text-[10px] xs:text-xs text-[#6C63FF] hover:text-[#5b53e6] flex items-center gap-1 font-medium whitespace-nowrap"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-3">
                  <Wallet className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-3 xs:space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {recentPayments.map((p) => {
                  // ✅ FIX: Get student name from studentMap only
                  const student = studentMap[p.studentId];
                  const displayName = student?.name || "Unknown";
                  
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-2 xs:gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate">
                          {p.receiptNumber || 'No receipt'}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#6C63FF]" />
                Recent Messages
              </h2>
              <button
                onClick={() => navigate('/admin/messages')}
                className="text-[10px] xs:text-xs text-[#6C63FF] hover:text-[#5b53e6] flex items-center gap-1 font-medium whitespace-nowrap"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-3">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3 xs:space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {recentMessages.map((m) => (
                  <div key={m.id} className="flex items-start gap-2 xs:gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        m.status === "unread" ? "bg-[#6C63FF] animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {m.name || 'Anonymous'}
                      </p>
                      <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {m.subject || 'No subject'}
                      </p>
                    </div>
                    <span className="text-[9px] xs:text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                      {timeAgo(m.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* FOOTER - Quick Stats */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border-2 border-emerald-200 dark:border-emerald-500/20">
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Active Students</p>
              <p className="text-base xs:text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeStudents}
              </p>
            </div>
            <div className="text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-500/5 border-2 border-blue-200 dark:border-blue-500/20">
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Active Courses</p>
              <p className="text-base xs:text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {activeCourses}
              </p>
            </div>
            <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-200 dark:border-amber-500/20">
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Pending Certificates</p>
              <p className="text-base xs:text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                {pendingCertificates}
              </p>
            </div>
            <div className="text-center p-2 rounded-xl bg-violet-50 dark:bg-violet-500/5 border-2 border-violet-200 dark:border-violet-500/20">
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Unread Messages</p>
              <p className="text-base xs:text-lg sm:text-xl font-bold text-violet-600 dark:text-violet-400">
                {unreadMessages}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;