// src/pages/Certificates.tsx
import React, { useMemo, useState, useEffect } from "react";
import { doc, updateDoc, addDoc, collection, serverTimestamp, Timestamp, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { 
  Award, CheckCircle2, Clock, CalendarCheck, Search, Plus, 
  Download, Eye, X, Trash2, Loader2, Sparkles, User, 
  BookOpen, Hash, Calendar, ChevronLeft, ChevronRight,
  FileText, AlertTriangle, Check, Layers, GraduationCap,
  Star, Zap, TrendingUp, Medal
} from "lucide-react";

import { db } from "../firebase/firebase";
import { formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton, Pagination } from "../components/ui/TableHelpers";
import type { Certificate, AppUser, Course, Enrollment } from "../types";

const PAGE_SIZE = 8;

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
      icon: X,
      iconBg: "bg-rose-100 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      title: "Error ❌",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-500",
      icon: Sparkles,
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
// 🎨 CONFIRM DIALOG
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
// 👁️ CERTIFICATE PREVIEW MODAL
// ============================================
const CertificatePreviewModal: React.FC<{
  certificate: Certificate;
  student?: AppUser;
  course?: Course;
  onClose: () => void;
}> = ({ certificate, student, course, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-4 xs:p-5 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 my-4 sm:my-8 animate-scale-up">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
              <Award className="h-5 w-5 xs:h-6 xs:w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Certificate Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {certificate.certificateNumber || 'No ID'}
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

        {/* Certificate Design */}
        <div className="rounded-xl border-2 border-[#6C63FF]/30 bg-gradient-to-br from-[#6C63FF]/5 to-[#8B5CF6]/5 p-6 sm:p-8 md:p-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
              <Medal className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-semibold">
            Certificate of Completion
          </p>
          <p className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {student?.name || "—"}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            has successfully completed
          </p>
          <p className="mt-1 font-bold text-[#6C63FF] text-base sm:text-lg md:text-xl">
            {course?.title || "—"}
          </p>
          <div className="mt-4 pt-4 border-t-2 border-[#6C63FF]/20 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Certificate No. {certificate.certificateNumber}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Issued: {formatDate(certificate.issueDate)}
            </span>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row justify-end gap-3 pt-4 mt-4 border-t-2 border-slate-200 dark:border-slate-700">
          {certificate.certificateUrl && (
            <a
              href={certificate.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full xs:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:shadow-lg hover:shadow-emerald-500/30"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full xs:w-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🏠 MAIN COMPONENT
// ============================================
const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type });
  };

  // ✅ Real-time listener for certificates
  useEffect(() => {
    setLoading(true);
    try {
      const certificatesRef = collection(db, "certificates");
      const q = query(certificatesRef);

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Certificate[];
          setCertificates(data);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching certificates:", err);
          setLoading(false);
          showToast("Failed to load certificates", "error");
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, []);

  // ✅ Real-time listener for students
  useEffect(() => {
    try {
      const studentsRef = collection(db, "users");
      const unsubscribe = onSnapshot(studentsRef,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[];
          setStudents(data);
        },
        (err) => {
          console.error("Error fetching students:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
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

  // ✅ Real-time listener for enrollments
  useEffect(() => {
    try {
      const enrollmentsRef = collection(db, "enrollments");
      const unsubscribe = onSnapshot(enrollmentsRef,
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
  }, []);

  const studentMap = useMemo(() => {
    const map: Record<string, AppUser> = {};
    students.forEach(s => map[s.id] = s);
    return map;
  }, [students]);

  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    courses.forEach(c => map[c.id] = c);
    return map;
  }, [courses]);

  const now = new Date();
  const issuedCount = certificates.filter(c => c.status === "issued").length;
  const pendingCount = certificates.filter(c => c.status === "pending").length;
  const issuedThisMonth = certificates.filter(c => {
    const d = c.issueDate?.toDate?.();
    return c.status === "issued" && d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = useMemo(() => {
    return certificates.filter(c => {
      const student = studentMap[c.studentId];
      const course = courseMap[c.courseId];
      const matchesSearch =
        !search ||
        student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        course?.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.certificateNumber?.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "all" || c.courseId === courseFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [certificates, studentMap, courseMap, search, courseFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "certificates", id));
      showToast("Certificate deleted successfully! 🗑️", "success");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete certificate", "error");
    }
  };

  const handleGenerateExisting = async (c: Certificate) => {
    try {
      const certNumber = c.certificateNumber || `XEV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      await updateDoc(doc(db, "certificates", c.id), {
        status: "issued",
        certificateNumber: certNumber,
        issueDate: Timestamp.now(),
        updatedAt: serverTimestamp(),
      });
      showToast("Certificate generated successfully! 🎉", "success");
    } catch (err) {
      console.error("Error generating:", err);
      showToast("Failed to generate certificate", "error");
    }
  };

  if (loading && certificates.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#6C63FF] animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Loading certificates...</p>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
        onConfirm={() => {
          handleDelete(confirmDialog.id);
          setConfirmDialog({ isOpen: false, id: "" });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, id: "" })}
      />

      <div className="max-w-7xl mx-auto space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
        
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-2 xs:p-2.5 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white shadow-lg shadow-[#6C63FF]/20">
                <Award className="h-5 w-5 xs:h-6 xs:w-6" />
              </div>
              <div>
                <h1 className="text-base xs:text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Certificates
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Manage student certificates
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerate(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6C63FF]/30 px-3 sm:px-4 md:px-5 py-2 xs:py-2.5 text-xs sm:text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] w-full xs:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Certificate</span>
              <Sparkles className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* STAT CARDS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          <StatCard label="Total" value={certificates.length} icon={Award} color="violet" loading={loading} />
          <StatCard label="Issued" value={issuedCount} icon={CheckCircle2} color="blue" loading={loading} />
          <StatCard label="Pending" value={pendingCount} icon={Clock} color="amber" loading={loading} />
          <StatCard label="This Month" value={issuedThisMonth} icon={CalendarCheck} color="green" loading={loading} />
        </div>

        {/* ============================================ */}
        {/* MAIN TABLE */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="p-3 xs:p-4 sm:p-6 flex flex-col sm:flex-row flex-wrap gap-3 border-b-2 border-slate-200 dark:border-slate-700">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by student, course, ID..."
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[130px]"
              >
                <option value="all" className="text-slate-700 dark:text-slate-200">📚 All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-700 dark:text-slate-200">
                    {c.title}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[130px]"
              >
                <option value="all" className="text-slate-700 dark:text-slate-200">📊 All Status</option>
                <option value="issued" className="text-slate-700 dark:text-slate-200">✅ Issued</option>
                <option value="pending" className="text-slate-700 dark:text-slate-200">⏳ Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading && certificates.length === 0 ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-4">
                <Award className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No certificates found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs xs:text-sm">
                <thead>
                  <tr className="text-left text-[10px] xs:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <th className="px-3 sm:px-6 py-3 font-semibold">Certificate ID</th>
                    <th className="px-3 py-3 font-semibold">Student</th>
                    <th className="px-3 py-3 font-semibold hidden md:table-cell">Course</th>
                    <th className="px-3 py-3 font-semibold hidden sm:table-cell">Issue Date</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 sm:px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700/40">
                  {paged.map((c) => {
                    const student = studentMap[c.studentId];
                    const course = courseMap[c.courseId];
                    const isIssued = c.status === "issued";

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-3 sm:px-6 py-3">
                          <div className="flex items-center gap-2 xs:gap-3">
                            <div className={`h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                              isIssued 
                                ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              <Award className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs xs:text-sm max-w-[100px] xs:max-w-[140px]">
                                {c.certificateNumber || "—"}
                              </p>
                              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">
                                {student?.name || "Unknown"}
                              </p>
                              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">
                                {formatDate(c.issueDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300 text-xs">
                              {student?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell text-xs">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            {course?.title || c.courseId}
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell text-xs">
                          {isIssued ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {formatDate(c.issueDate)}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        
                        <td className="px-3 py-3">
                          <StatusBadge label={c.status} />
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3">
                          <div className="flex items-center justify-end gap-0.5 xs:gap-1 sm:gap-1.5">
                            {isIssued ? (
                              <>
                                <button
                                  onClick={() => setPreviewCert(c)}
                                  className="p-1.5 xs:p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/20 transition-all"
                                  title="Preview"
                                >
                                  <Eye className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                                </button>
                                {c.certificateUrl && (
                                  <a
                                    href={c.certificateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 xs:p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 border-2 border-transparent hover:border-emerald-500/20 transition-all"
                                    title="Download"
                                  >
                                    <Download className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setConfirmDialog({ isOpen: true, id: c.id })}
                                  className="p-1.5 xs:p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border-2 border-transparent hover:border-rose-500/20 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleGenerateExisting(c)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-3 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs font-medium text-white hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300 hover:scale-[1.02]"
                              >
                                <Sparkles className="h-3 w-3" />
                                Generate
                              </button>
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
          {!loading && filtered.length > 0 && (
            <div className="border-t-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 flex flex-col xs:flex-row items-center justify-between gap-3">
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
      {/* PREVIEW MODAL */}
      {/* ============================================ */}
      {previewCert && (
        <CertificatePreviewModal
          certificate={previewCert}
          student={studentMap[previewCert.studentId]}
          course={courseMap[previewCert.courseId]}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* ============================================ */}
      {/* GENERATE MODAL */}
      {/* ============================================ */}
      {showGenerate && (
        <GenerateCertificateModal
          enrollments={enrollments.filter(e => e.completionStatus === "completed" && !e.certificateIssued)}
          students={studentMap}
          courses={courseMap}
          onClose={() => setShowGenerate(false)}
          onSuccess={() => {
            showToast("Certificate generated successfully! 🎉", "success");
          }}
          onError={(message) => {
            showToast(message || "Failed to generate certificate", "error");
          }}
        />
      )}
    </div>
  );
};

// ============================================
// 📝 GENERATE CERTIFICATE MODAL
// ============================================
const GenerateCertificateModal: React.FC<{
  enrollments: Enrollment[];
  students: Record<string, AppUser>;
  courses: Record<string, Course>;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ enrollments, students, courses, onClose, onSuccess, onError }) => {
  const [enrollmentId, setEnrollmentId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
      onError("Please select a completed enrollment");
      return;
    }

    setSaving(true);
    try {
      const certNumber = `XEV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      await addDoc(collection(db, "certificates"), {
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        enrollmentId: enrollment.id,
        certificateNumber: certNumber,
        issueDate: Timestamp.now(),
        status: "issued",
        certificateUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      await updateDoc(doc(db, "enrollments", enrollment.id), { 
        certificateIssued: true,
        updatedAt: serverTimestamp()
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error generating:", err);
      let message = "Failed to generate certificate. ";
      if (err.message?.includes("permission-denied")) {
        message = "Permission denied. Please check Firestore security rules.";
      } else {
        message += err.message || "Please try again.";
      }
      onError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 xs:p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-3 xs:p-4 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 my-2 xs:my-4 sm:my-8 animate-scale-up">
        
        <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="p-1.5 xs:p-2 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
              <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm xs:text-base sm:text-lg text-slate-900 dark:text-white">
                Generate Certificate
              </h3>
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400">
                Create a certificate for completed enrollment
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 xs:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <X className="h-4 w-4 xs:h-5 xs:w-5 text-slate-400" />
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 mb-4">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">No Eligible Enrollments</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Students become eligible once their enrollment is marked as completed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Select Completed Enrollment <span className="text-rose-500">*</span>
              </label>
              <select
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              >
                <option value="" className="text-slate-700 dark:text-slate-200">Select enrollment</option>
                {enrollments.map((e) => (
                  <option key={e.id} value={e.id} className="text-slate-700 dark:text-slate-200">
                    {students[e.studentId]?.name || e.studentId} — {courses[e.courseId]?.title || e.courseId}
                  </option>
                ))}
              </select>
            </div>

            {enrollmentId && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Student is eligible for certificate</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 mt-4 xs:mt-5 sm:mt-6 pt-4 xs:pt-5 sm:pt-6 border-t-2 border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full xs:w-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors order-2 xs:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={saving || !enrollmentId || enrollments.length === 0}
            className="w-full xs:w-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed order-1 xs:order-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/30 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 xs:h-4 xs:w-4" />
                Generate Certificate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificates;