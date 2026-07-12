// src/pages/user/Assignments.tsx
import React, { useMemo, useState, useEffect } from "react";
import { where, doc, setDoc, serverTimestamp, Timestamp, onSnapshot, query, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  FileText, Send, CheckCircle2, Star, Search, Upload, X, 
  MessageSquare, SlidersHorizontal, Clock, AlertCircle, 
  Sparkles, Award, Calendar, BookOpen, ChevronLeft, ChevronRight,
  Loader2, Paperclip, Check, Circle, Zap, Info, AlertTriangle  
} from "lucide-react";

import { db, storage } from "../../firebase/firebase";
import { formatDate } from "../../lib/format";
import type { Assignment, Course, Enrollment, Submission } from "../../types";

const PAGE_SIZE = 8;
const TABS = ["All Assignments", "Pending", "Submitted", "Graded"] as const;

// ============================================
// 🎨 BEAUTIFUL GLASS CARD COMPONENT
// ============================================
const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

// ============================================
// 🎨 TOAST NOTIFICATION
// ============================================
const Toast: React.FC<{
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-500",
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: "Success ✨",
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-500",
      icon: AlertCircle,
      iconBg: "bg-rose-100 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      title: "Error ❌",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-500",
      icon: Info,
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: "Info ℹ️",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-500",
      icon: AlertTriangle,
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: "Warning ⚠️",
    },
  };

  const { bg, border, icon: Icon, iconBg, iconColor, title } = config[type];

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] w-[calc(100%-2rem)] sm:w-[400px] animate-slide-down">
      <div className={`relative overflow-hidden rounded-2xl border-2 ${border} ${bg} p-4 shadow-2xl backdrop-blur-sm`}>
        <div className={`absolute top-0 left-0 h-1 w-full ${border.replace('border-', 'bg-')}`} />
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-xl ${iconBg} border-2 ${border}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-white">{title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 STAT CARD COMPONENT
// ============================================
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}> = ({ label, value, icon: Icon, color, loading }) => {
  const colorMap = {
    violet: {
      border: "border-violet-200 dark:border-violet-500/30",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      icon: "text-violet-600 dark:text-violet-400",
      text: "text-violet-700 dark:text-violet-400",
    },
    amber: {
      border: "border-amber-200 dark:border-amber-500/30",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-400",
      text: "text-amber-700 dark:text-amber-400",
    },
    blue: {
      border: "border-blue-200 dark:border-blue-500/30",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-700 dark:text-blue-400",
    },
    green: {
      border: "border-green-200 dark:border-green-500/30",
      bg: "bg-green-50 dark:bg-green-500/10",
      icon: "text-green-600 dark:text-green-400",
      text: "text-green-700 dark:text-green-400",
    },
  };

  const styles = colorMap[color as keyof typeof colorMap] || colorMap.violet;

  return (
    <div className={`bg-white dark:bg-[#1E293B] rounded-2xl border-2 ${styles.border} p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] xs:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 truncate">
            {loading ? <Loader2 className="h-4 w-4 xs:h-5 xs:w-5 animate-spin text-[#6C63FF]" /> : value}
          </p>
        </div>
        <div className={`h-9 w-9 xs:h-10 xs:w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl ${styles.bg} flex items-center justify-center border-2 ${styles.border} flex-shrink-0 ml-2`}>
          <Icon className={`h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5 ${styles.icon}`} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📝 STATUS BADGE COMPONENT
// ============================================
const StatusBadge: React.FC<{ label: string; className?: string }> = ({ label, className = "" }) => {
  const config = {
    pending: {
      bg: "bg-amber-100 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: Clock,
    },
    submitted: {
      bg: "bg-blue-100 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/30",
      text: "text-blue-700 dark:text-blue-400",
      icon: CheckCircle2,
    },
    graded: {
      bg: "bg-green-100 dark:bg-green-500/10",
      border: "border-green-200 dark:border-green-500/30",
      text: "text-green-700 dark:text-green-400",
      icon: Award,
    },
  };

  const status = label.toLowerCase() as keyof typeof config;
  const { bg, border, text, icon: Icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold border-2 ${bg} ${border} ${text} ${className}`}>
      <Icon className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

// ============================================
// 🏠 MAIN COMPONENT
// ============================================
const AssignmentsPage: React.FC = () => {
  // State for real-time data
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const [tab, setTab] = useState<(typeof TABS)[number]>("All Assignments");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [uploadFor, setUploadFor] = useState<Assignment | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<Submission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type });
  };

  // Get current user ID
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setUid(userId);
      setLoadingStudent(false);
    } else {
      setLoadingStudent(false);
    }
  }, []);

  // ✅ Real-time listener for enrollments
  useEffect(() => {
    if (!uid) return;

    try {
      const enrollmentsRef = collection(db, "enrollments");
      const q = query(enrollmentsRef, where("studentId", "==", uid));
      
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrollment[];
          setEnrollments(data);
        },
        (err) => {
          console.error("Error fetching enrollments:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
    }
  }, [uid]);

  // ✅ Real-time listener for assignments
  useEffect(() => {
    try {
      const assignmentsRef = collection(db, "assignments");
      const unsubscribe = onSnapshot(assignmentsRef,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assignment[];
          setAssignments(data);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching assignments:", err);
          setLoading(false);
          showToast("Failed to load assignments", "error");
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, []);

  // ✅ Real-time listener for courses
  useEffect(() => {
    try {
      const coursesRef = collection(db, "courses");
      const unsubscribe = onSnapshot(coursesRef,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
          setCourses(data);
        },
        (err) => {
          console.error("Error fetching courses:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
    }
  }, []);

  // ✅ Real-time listener for submissions
  useEffect(() => {
    if (!uid) return;

    try {
      const submissionsRef = collection(db, "submissions");
      const q = query(submissionsRef, where("studentId", "==", uid));
      
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Submission[];
          setSubmissions(data);
        },
        (err) => {
          console.error("Error fetching submissions:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
    }
  }, [uid]);

  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    courses.forEach(c => map[c.id] = c);
    return map;
  }, [courses]);

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map(e => e.courseId)), [enrollments]);
  
  const submissionMap = useMemo(() => {
    const map: Record<string, Submission & { id: string }> = {};
    submissions.forEach(s => {
      map[s.assignmentId] = { ...s, id: s.assignmentId };
    });
    return map;
  }, [submissions]);

  const myAssignments = useMemo(
    () => assignments.filter(a => enrolledCourseIds.has(a.courseId) && a.status !== "draft"),
    [assignments, enrolledCourseIds]
  );

  const withStatus = (a: Assignment) => submissionMap[a.id]?.status || "pending";

  const stats = {
    total: myAssignments.length,
    pending: myAssignments.filter(a => withStatus(a) === "pending").length,
    submitted: myAssignments.filter(a => withStatus(a) === "submitted").length,
    graded: myAssignments.filter(a => withStatus(a) === "graded").length,
  };
  
  const gradedWithMarks = myAssignments.filter(a => submissionMap[a.id]?.marks !== undefined);
  const avgScore = gradedWithMarks.length
    ? (gradedWithMarks.reduce((s, a) => s + (submissionMap[a.id]?.marks || 0), 0) / gradedWithMarks.length).toFixed(1)
    : "—";

  const filtered = useMemo(() => {
    return myAssignments.filter(a => {
      const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
      const status = withStatus(a);
      const matchesTab =
        tab === "All Assignments" ||
        (tab === "Pending" && status === "pending") ||
        (tab === "Submitted" && status === "submitted") ||
        (tab === "Graded" && status === "graded");
      return matchesSearch && matchesTab;
    });
  }, [myAssignments, search, tab, submissionMap]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const loadingAll = loading || loadingStudent;

  if (loadingAll && myAssignments.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#6C63FF] animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
        
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-2 xs:p-2.5 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#5b53e6] text-white">
                <FileText className="h-5 w-5 xs:h-6 xs:w-6" />
              </div>
              <div>
                <h1 className="text-base xs:text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  My Assignments
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Track and submit your assignments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 xs:gap-2 w-full xs:w-auto">
              <div className="relative flex-1 xs:min-w-[140px] sm:min-w-[180px] md:min-w-[200px]">
                <Search className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search assignments..."
                  className="w-full rounded-lg xs:rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] py-1.5 xs:py-2 sm:py-2.5 pl-8 xs:pl-9 sm:pl-10 pr-3 xs:pr-4 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                />
              </div>
              <button className="rounded-lg xs:rounded-xl border-2 border-slate-200 dark:border-slate-700 px-2.5 xs:px-3 py-1.5 xs:py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] transition-all">
                <SlidersHorizontal className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* STAT CARDS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          <StatCard label="Total" value={stats.total} icon={FileText} color="violet" loading={loadingAll} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" loading={loadingAll} />
          <StatCard label="Submitted" value={stats.submitted} icon={CheckCircle2} color="blue" loading={loadingAll} />
          <StatCard label="Avg Score" value={avgScore} icon={Award} color="green" loading={loadingAll} />
        </div>

        {/* ============================================ */}
        {/* MAIN TABLE */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          
          {/* Tabs */}
          <div className="flex gap-0.5 xs:gap-1 overflow-x-auto p-1.5 xs:p-2 sm:p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-lg xs:rounded-xl px-2 xs:px-2.5 sm:px-3 md:px-4 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-medium transition-all ${
                  tab === t 
                    ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Table Content */}
          {loadingAll && myAssignments.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="h-10 w-10 text-[#6C63FF] animate-spin mx-auto" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading assignments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-4">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No assignments found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Try a different tab or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs xs:text-sm">
                <thead>
                  <tr className="text-left text-[10px] xs:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <th className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 font-semibold">Assignment</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-semibold hidden md:table-cell">Course</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-semibold hidden sm:table-cell">Due Date</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-semibold">Status</th>
                    <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-semibold hidden xs:table-cell">Score</th>
                    <th className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700/40">
                  {paged.map((a) => {
                    const submission = submissionMap[a.id];
                    const status = submission?.status || "pending";
                    const isOverdue = a.dueDate && a.dueDate.toDate().getTime() < Date.now() && status === "pending";
                    
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3">
                          <div className="flex items-center gap-2 xs:gap-3">
                            <div className={`h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                              status === 'graded' ? 'bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400' :
                              status === 'submitted' ? 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400' :
                              isOverdue ? 'bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' :
                              'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {status === 'graded' ? <Award className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4.5 sm:w-4.5" /> :
                               status === 'submitted' ? <CheckCircle2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4.5 sm:w-4.5" /> :
                               <FileText className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4.5 sm:w-4.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs xs:text-sm max-w-[100px] xs:max-w-[140px] sm:max-w-[180px]">
                                {a.title}
                              </p>
                              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[180px]">
                                {a.description}
                              </p>
                              {/* Mobile course & due date info */}
                              <div className="flex flex-wrap gap-1.5 mt-1 md:hidden">
                                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-slate-400">
                                  📚 {courseMap[a.courseId]?.title}
                                </span>
                                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-slate-400">
                                  📅 {formatDate(a.dueDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell text-xs">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3 text-slate-400" />
                            {courseMap[a.courseId]?.title}
                          </div>
                        </td>

                        <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            {isOverdue ? (
                              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                            ) : (
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs ${isOverdue ? "text-rose-500 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
                              {formatDate(a.dueDate)}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold border-2 bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400">
                              <AlertCircle className="h-2.5 w-2.5" />
                              Overdue
                            </span>
                          ) : (
                            <StatusBadge label={status} />
                          )}
                        </td>

                        <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-slate-700 dark:text-slate-200 hidden xs:table-cell text-xs">
                          {submission?.marks !== undefined ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <Star className="h-3 w-3 text-amber-500" />
                              {submission.marks}/{a.totalMarks}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3">
                          <div className="flex items-center justify-end gap-1 xs:gap-1.5 sm:gap-2">
                            {status === "graded" && submission?.feedback && (
                              <button
                                onClick={() => setFeedbackFor(submission)}
                                className="p-1 xs:p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors border-2 border-transparent hover:border-[#6C63FF]/20"
                                aria-label="View feedback"
                                title="View Feedback"
                              >
                                <MessageSquare className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                              </button>
                            )}
                            {status === "pending" && (
                              <button
                                onClick={() => setUploadFor(a)}
                                className={`rounded-lg xs:rounded-xl px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-medium transition-all duration-200 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md hover:shadow-lg active:scale-95 border-2 border-white/20`}
                              >
                                {isOverdue ? "⚠️ Late" : "Submit"}
                              </button>
                            )}
                            {status === "submitted" && (
                              <span className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Submitted
                              </span>
                            )}
                            {status === "graded" && (
                              <span className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Graded
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loadingAll && filtered.length > 0 && (
            <div className="border-t-2 border-slate-200 dark:border-slate-700 p-2 xs:p-3 sm:p-4 flex flex-col xs:flex-row items-center justify-between gap-2 xs:gap-3">
              <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1 xs:gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                </button>
                <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 px-2 xs:px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* UPLOAD MODAL */}
      {/* ============================================ */}
      {uploadFor && uid && (
        <UploadModal 
          assignment={uploadFor} 
          studentId={uid} 
          onClose={() => setUploadFor(null)}
          onSuccess={() => {
            showToast("Assignment submitted successfully! 🎉", "success");
            setUploadFor(null);
          }}
          onError={(message) => {
            showToast(message || "Failed to submit assignment", "error");
          }}
        />
      )}

      {/* ============================================ */}
      {/* FEEDBACK MODAL */}
      {/* ============================================ */}
      {feedbackFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 xs:p-4">
          <div className="w-full max-w-md rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-4 xs:p-5 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base xs:text-lg text-slate-900 dark:text-white">Faculty Feedback</h3>
              </div>
              <button 
                onClick={() => setFeedbackFor(null)} 
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label="Close feedback"
              >
                <X className="h-4 w-4 xs:h-5 xs:w-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
                <p className="text-sm xs:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                  {feedbackFor.feedback || "No feedback provided."}
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Score</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {feedbackFor.marks}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setFeedbackFor(null)}
              className="w-full mt-5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 📤 UPLOAD MODAL
// ============================================
const UploadModal: React.FC<{
  assignment: Assignment;
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ assignment, studentId, onClose, onSuccess, onError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      onError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const path = `submissions/${studentId}/${assignment.id}/${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await setDoc(doc(db, "submissions", `${studentId}_${assignment.id}`), {
        assignmentId: assignment.id,
        studentId,
        courseId: assignment.courseId,
        status: "submitted",
        submittedAt: Timestamp.now(),
        attachmentUrl: url,
        fileName: file.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      onSuccess();
    } catch (err: any) {
      console.error("Error uploading:", err);
      let message = "Failed to submit assignment. ";
      if (err.message?.includes("permission-denied")) {
        message = "Permission denied. Please check your access.";
      } else if (err.message?.includes("storage")) {
        message = "Storage error. Please try again.";
      } else {
        message += err.message || "Please try again.";
      }
      onError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 xs:p-4">
      <div className="w-full max-w-md rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-4 xs:p-5 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 animate-scale-up">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base xs:text-lg text-slate-900 dark:text-white">Submit Assignment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{assignment.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Close upload modal"
          >
            <X className="h-4 w-4 xs:h-5 xs:w-5 text-slate-400" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">Assignment Details</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">{assignment.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📅 Due: {formatDate(assignment.dueDate)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">📊 Total Marks: {assignment.totalMarks}</p>
          </div>
          
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-6 xs:py-8 px-4 cursor-pointer hover:border-[#6C63FF] hover:bg-[#6C63FF]/5 transition-all duration-300">
            <div className="p-3 rounded-full bg-[#6C63FF]/10">
              <Paperclip className="h-6 w-6 xs:h-7 xs:w-7 text-[#6C63FF]" />
            </div>
            <span className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
              {file ? file.name : "Click to select a file"}
            </span>
            <span className="text-[10px] xs:text-xs text-slate-400">
              PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </span>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
          
          {file && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="ml-auto text-slate-400 hover:text-rose-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 mt-5 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
          <button 
            onClick={onClose} 
            className="w-full xs:w-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors order-2 xs:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full xs:w-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300 order-1 xs:order-2 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;