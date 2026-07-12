// src/pages/Assignments.tsx
import React, { useMemo, useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp, Timestamp, onSnapshot, query } from "firebase/firestore";
import { 
  FileText, Send, AlertTriangle, CheckCircle2, Search, Plus, 
  Pencil, Trash2, Paperclip, X, Loader2, Calendar, Clock, 
  BookOpen, User, CheckCircle, XCircle, Info, Shield, 
  Sparkles, Award, Zap, TrendingUp, Layers, Hash,
  ChevronLeft, ChevronRight
} from "lucide-react";

import { db } from "../firebase/firebase";
import { formatDate } from "../lib/format";
import type { Assignment, Course, AppUser } from "../types";

const PAGE_SIZE = 8;
const emptyAssignment: Partial<Assignment> = {
  title: "",
  description: "",
  courseId: "",
  totalMarks: 100,
  status: "draft",
  attachment: "",
};

// ============================================
// 🎨 BEAUTIFUL TOAST NOTIFICATION
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
      icon: CheckCircle,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: "Success",
      emoji: "✨",
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-500",
      icon: XCircle,
      iconBg: "bg-rose-100 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      title: "Error",
      emoji: "❌",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-500",
      icon: Info,
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: "Info",
      emoji: "ℹ️",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-500",
      icon: AlertTriangle,
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: "Warning",
      emoji: "⚠️",
    },
  };

  const { bg, border, icon: Icon, iconBg, iconColor, title, emoji } = config[type];

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] w-[calc(100%-2rem)] sm:w-[400px] animate-slide-down">
      <div className={`relative overflow-hidden rounded-2xl border-2 ${border} ${bg} p-4 shadow-2xl backdrop-blur-sm`}>
        {/* Decorative line */}
        <div className={`absolute top-0 left-0 h-1 w-full ${border.replace('border-', 'bg-')}`} />
        
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-xl ${iconBg} border-2 ${border}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {title}
              <span className="text-lg">{emoji}</span>
            </p>
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
// 🎨 CONFIRMATION DIALOG
// ============================================
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border-2 border-rose-200 dark:border-rose-500/30 animate-scale-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors shadow-lg shadow-rose-600/20"
          >
            Yes, Delete
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
  value: number;
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
    blue: {
      border: "border-blue-200 dark:border-blue-500/30",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-700 dark:text-blue-400",
    },
    red: {
      border: "border-red-200 dark:border-red-500/30",
      bg: "bg-red-50 dark:bg-red-500/10",
      icon: "text-red-600 dark:text-red-400",
      text: "text-red-700 dark:text-red-400",
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
    <div className={`bg-white dark:bg-[#1E293B] rounded-2xl border-2 ${styles.border} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#6C63FF]" /> : value}
          </p>
        </div>
        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${styles.bg} flex items-center justify-center border-2 ${styles.border}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${styles.icon}`} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🏠 MAIN COMPONENT
// ============================================
const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalAssignment, setModalAssignment] = useState<Assignment | "new" | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type });
  };

  // Real-time listeners
  useEffect(() => {
    setLoading(true);
    try {
      const assignmentsRef = collection(db, "assignments");
      const q = query(assignmentsRef);
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assignment[];
          setAssignments(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Error fetching assignments:", err);
          setError("Failed to load assignments");
          setLoading(false);
          showToast("Failed to load assignments. Please refresh.", "error");
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to setup real-time updates");
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    try {
      const usersRef = collection(db, "users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[];
        setUsers(data);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    courses.forEach(c => map[c.id] = c);
    return map;
  }, [courses]);

  const userMap = useMemo(() => {
    const map: Record<string, AppUser> = {};
    users.forEach(u => map[u.id] = u);
    return map;
  }, [users]);

  // src/pages/Assignments.tsx - Fix the isOverdue function (around line 299)

const isOverdue = (a: Assignment) => {
  if (!a.dueDate || a.status !== "active") return false;
  try {
    // ✅ FIX: Handle both Timestamp and Date types
    let dueDate;
    if (a.dueDate && typeof a.dueDate === 'object' && 'toDate' in a.dueDate) {
      dueDate = a.dueDate.toDate();
    } else if (a.dueDate) {
      dueDate = new Date(a.dueDate);
    } else {
      return false;
    }
    return dueDate.getTime() < Date.now();
  } catch { return false; }
};

  const overdueCount = assignments.filter(isOverdue).length;
  const activeCount = assignments.filter(a => a.status === "active").length;
  const closedCount = assignments.filter(a => a.status === "closed").length;

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const course = courseMap[a.courseId];
      const matchesSearch = !search || 
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        course?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "all" || a.courseId === courseFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [assignments, courseMap, search, courseFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "assignments", id));
      showToast("Assignment deleted successfully! 🗑️", "success");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete assignment. Please try again.", "error");
    }
  };

  if (loading && assignments.length === 0) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 md:p-6">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={() => {
          handleDelete(confirmDialog.id);
          setConfirmDialog({ isOpen: false, id: "" });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, id: "" })}
      />

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#5b53e6] text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Manage all course assignments
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setModalAssignment("new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5b53e6] hover:shadow-lg hover:shadow-[#6C63FF]/30 px-4 sm:px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
            <Sparkles className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 mb-4 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================ */}
      {/* STAT CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Total" value={assignments.length} icon={FileText} color="violet" loading={loading} />
        <StatCard label="Published" value={activeCount} icon={Send} color="blue" loading={loading} />
        <StatCard label="Overdue" value={overdueCount} icon={AlertTriangle} color="red" loading={loading} />
        <StatCard label="Closed" value={closedCount} icon={CheckCircle2} color="green" loading={loading} />
      </div>

      {/* ============================================ */}
      {/* TABLE SECTION */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        
        {/* Filters */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row flex-wrap gap-3 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search assignments..."
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
              className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[130px]"
            >
              <option value="all">📚 All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[130px]"
            >
              <option value="all">📊 All Status</option>
              <option value="active">✅ Published</option>
              <option value="draft">📝 Draft</option>
              <option value="closed">🔒 Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading && assignments.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="h-10 w-10 text-[#6C63FF] animate-spin mx-auto" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading assignments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-4">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No assignments found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create your first assignment to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <th className="px-3 sm:px-6 py-3 font-semibold">Assignment</th>
                  <th className="px-3 py-3 font-semibold hidden md:table-cell">Course</th>
                  <th className="px-3 py-3 font-semibold hidden lg:table-cell">Due Date</th>
                  <th className="px-3 py-3 font-semibold hidden sm:table-cell">Marks</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold hidden xl:table-cell">Created By</th>
                  <th className="px-3 sm:px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700/40">
                {paged.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center border-2 border-[#6C63FF]/20 shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm">
                            {a.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-[220px]">
                            {a.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1 md:hidden">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              📚 {courseMap[a.courseId]?.title || a.courseId}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              📅 {formatDate(a.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        {courseMap[a.courseId]?.title || a.courseId}
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        {isOverdue(a) ? (
                          <Clock className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span className={`text-xs sm:text-sm ${isOverdue(a) ? "text-rose-500 font-semibold" : "text-slate-600 dark:text-slate-300"}`}>
                          {formatDate(a.dueDate)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Hash className="h-3 w-3 mr-1 text-slate-400" />
                        {a.totalMarks}
                      </span>
                    </td>
                    
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border-2 ${
                        isOverdue(a) ? 'bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400' :
                        a.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' :
                        a.status === 'draft' ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400' :
                        'bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-400'
                      }`}>
                        {isOverdue(a) ? '⏰ Overdue' : a.status === 'active' ? '✅ Published' : a.status === 'draft' ? '📝 Draft' : '🔒 Closed'}
                      </span>
                    </td>
                    
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden xl:table-cell text-xs">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {userMap[a.createdBy || ""]?.name || "—"}
                      </div>
                    </td>
                    
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        {a.attachment && (
                          <a href={a.attachment} target="_blank" rel="noreferrer"
                            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/20 transition-all"
                            title="Attachment">
                            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setModalAssignment(a)}
                          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/20 transition-all"
                          title="Edit">
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDialog({ isOpen: true, id: a.id })}
                          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border-2 border-transparent hover:border-rose-500/20 transition-all"
                          title="Delete">
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="border-t-2 border-slate-200 dark:border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 px-2 sm:px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* MODAL */}
      {/* ============================================ */}
      {modalAssignment && (
        <AssignmentModal
          assignment={modalAssignment === "new" ? null : modalAssignment}
          courses={courses}
          onClose={() => setModalAssignment(null)}
          onSuccess={() => {
            showToast(
              modalAssignment === "new" 
                ? "Assignment created successfully! 🎉" 
                : "Assignment updated successfully! ✨",
              "success"
            );
          }}
          onError={(message) => {
            showToast(message || "Failed to save assignment. Please try again.", "error");
          }}
        />
      )}
    </div>
  );
};

// ============================================
// 📝 ASSIGNMENT MODAL
// ============================================
const AssignmentModal: React.FC<{
  assignment: Assignment | null;
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ assignment, courses, onClose, onSuccess, onError }) => {
  const [form, setForm] = useState<Partial<Assignment>>(assignment || emptyAssignment);
  const [dueDateStr, setDueDateStr] = useState(
  assignment?.dueDate ? 
    (assignment.dueDate && typeof assignment.dueDate === 'object' && 'toDate' in assignment.dueDate 
      ? assignment.dueDate.toDate() 
      : new Date(assignment.dueDate)
    ).toISOString().slice(0, 10) 
    : ""
);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Assignment, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.title || !form.courseId) {
      onError("Title and Course are required");
      return;
    }

    setSaving(true);
    try {
      const userId = localStorage.getItem("userId") || "admin";
      
      const payload: any = {
        title: form.title.trim(),
        description: form.description?.trim() || "",
        courseId: form.courseId,
        totalMarks: Number(form.totalMarks) || 100,
        status: form.status || "draft",
        updatedAt: serverTimestamp(),
      };

      if (dueDateStr) {
        payload.dueDate = Timestamp.fromDate(new Date(dueDateStr));
      }

      if (form.attachment) {
        payload.attachment = form.attachment;
      }

      if (assignment) {
        await updateDoc(doc(db, "assignments", assignment.id), payload);
        onSuccess();
        onClose();
      } else {
        await addDoc(collection(db, "assignments"), {
          ...payload,
          createdBy: userId,
          createdAt: serverTimestamp(),
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      let message = "Failed to save assignment. ";
      if (error.message?.includes("permission-denied")) {
        message = "Permission denied. Please check Firestore security rules.";
      } else if (error.message?.includes("index")) {
        message = "Please create the required Firestore index.";
      } else {
        message += error.message || "Please try again.";
      }
      onError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 my-4 sm:my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#5b53e6] text-white">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                {assignment ? "Edit Assignment" : "Create Assignment"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {assignment ? "Update assignment details" : "Add a new assignment to a course"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              value={form.title || ""}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter assignment title..."
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Course <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.courseId || ""}
              onChange={(e) => set("courseId", e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
            >
              <option value="">Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Due Date
              </label>
              <input
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Total Marks
              </label>
              <input
                type="number"
                value={form.totalMarks || 100}
                onChange={(e) => set("totalMarks", Number(e.target.value))}
                placeholder="Marks"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Status
            </label>
            <select
              value={form.status || "draft"}
              onChange={(e) => set("status", e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
            >
              <option value="draft">📝 Draft</option>
              <option value="active">✅ Published</option>
              <option value="closed">🔒 Closed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the assignment..."
              rows={3}
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.courseId}
            className="rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5b53e6] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/30 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {assignment ? "Update" : "Create"}
                <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assignments;