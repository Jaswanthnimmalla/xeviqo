// src/pages/Payments.tsx
import React, { useMemo, useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp, Timestamp, onSnapshot, query } from "firebase/firestore";
import { 
  Wallet, CreditCard, Clock, RotateCcw, Search, Download, 
  Plus, Eye, X, Trash2, AlertTriangle, CheckCircle2, 
  Loader2, Sparkles, ChevronLeft, ChevronRight, 
  User, Calendar, Hash, Tag, FileText, ArrowUpRight,
  Ban, RefreshCw, Zap, Award, TrendingUp, Layers, Pencil
} from "lucide-react";

import { db } from "../firebase/firebase";
import { formatCurrency, formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton, Pagination } from "../components/ui/TableHelpers";
import type { Payment, AppUser, Enrollment, Course } from "../types";

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
// 👁️ VIEW PAYMENT MODAL
// ============================================
const ViewPaymentModal: React.FC<{
  payment: Payment;
  user: AppUser | undefined;
  enrollment: Enrollment | undefined;
  course: Course | undefined;
  onClose: () => void;
}> = ({ payment, user, enrollment, course, onClose }) => {
  const statusColors = {
    paid: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10",
    approved: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10",
    pending: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10",
    failed: "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10",
    refunded: "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10",
  };

  const statusIcon = {
    paid: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    approved: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    pending: <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    failed: <X className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
    refunded: <RotateCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  };

  const status = payment.paymentStatus as keyof typeof statusColors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-4 xs:p-5 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 my-4 sm:my-8 animate-scale-up">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
              <CreditCard className="h-5 w-5 xs:h-6 xs:w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Payment Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {payment.receiptNumber || 'No receipt'}
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

        <div className={`p-4 rounded-xl border-2 ${statusColors[status] || statusColors.pending} mb-6 flex items-center gap-3`}>
          {statusIcon[status] || statusIcon.pending}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {payment.paymentDate ? formatDate(payment.paymentDate) : 'Date not available'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</p>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction ID</p>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-1 truncate">
              {payment.transactionId || 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Receipt</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {payment.receiptNumber || 'N/A'}
            </p>
          </div>
          {enrollment && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700 sm:col-span-2">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrollment</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {course?.title || enrollment.courseId || 'N/A'}
              </p>
            </div>
          )}
          {payment.remarks && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700 sm:col-span-2">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remarks</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{payment.remarks}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col xs:flex-row justify-end gap-3 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
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
const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalPayment, setModalPayment] = useState<Payment | "new" | null>(null);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type });
  };

  // ✅ Real-time listener for payments
  useEffect(() => {
    setLoading(true);
    try {
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef);

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
          setPayments(data);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching payments:", err);
          setLoading(false);
          showToast("Failed to load payments", "error");
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, []);

  // ✅ Real-time listener for users
  useEffect(() => {
    try {
      const usersRef = collection(db, "users");
      const unsubscribe = onSnapshot(usersRef,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[];
          setUsers(data);
        },
        (err) => {
          console.error("Error fetching users:", err);
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

  const userMap = useMemo(() => {
    const map: Record<string, AppUser> = {};
    users.forEach(u => map[u.id] = u);
    return map;
  }, [users]);

  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    courses.forEach(c => map[c.id] = c);
    return map;
  }, [courses]);

  const totalPaid = useMemo(
    () => payments.filter(p => p.paymentStatus === "paid" || p.paymentStatus === "approved").reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );
  const totalPending = useMemo(
    () => payments.filter(p => p.paymentStatus === "pending").reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );
  const totalRefunded = useMemo(
    () => payments.filter(p => p.paymentStatus === "refunded").reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const user = userMap[p.studentId];
      const matchesSearch =
        !search ||
        user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, userMap, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "payments", id));
      showToast("Payment deleted successfully! 🗑️", "success");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete payment", "error");
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      showToast("No payments to export", "warning");
      return;
    }

    const rows = [
      ["Receipt", "Student", "Amount", "Status", "Date"],
      ...filtered.map((p) => {
        const user = userMap[p.studentId];
        return [
          p.receiptNumber || "N/A",
          user?.name || "Unknown",
          p.amount || 0,
          p.paymentStatus || "N/A",
          formatDate(p.paymentDate),
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} payments successfully! 📊`, "success");
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#6C63FF] animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Loading payments...</p>
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
        title="Delete Payment"
        message="Are you sure you want to delete this payment record? This action cannot be undone."
        onConfirm={() => {
          handleDelete(confirmDialog.id);
          setConfirmDialog({ isOpen: false, id: "" });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, id: "" })}
      />

      <div className="max-w-7xl mx-auto space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
        
        {/* ============================================ */}
        {/* HEADER - Buttons on right side */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-3">
            
            {/* Left Section - Icon + Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white shadow-lg shadow-[#6C63FF]/20 flex-shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  Payments
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                  <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline">Manage all payment transactions</span>
                  <span className="xs:hidden">Payment transactions</span>
                </p>
              </div>
            </div>

            {/* Right Section - Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={exportCSV}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] transition-all duration-300 hover:shadow-md"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button
                onClick={() => setModalPayment("new")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6C63FF]/30 px-2.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Payment</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* STAT CARDS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          <StatCard label="Total Revenue" value={formatCurrency(totalPaid)} icon={Wallet} color="violet" loading={loading} />
          <StatCard label="Pending" value={formatCurrency(totalPending)} icon={Clock} color="amber" loading={loading} />
          <StatCard label="Refunded" value={formatCurrency(totalRefunded)} icon={RotateCcw} color="red" loading={loading} />
          <StatCard label="Transactions" value={payments.length} icon={CreditCard} color="blue" loading={loading} />
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
                placeholder="Search by student or receipt..."
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[130px]"
              >
                <option value="all" className="text-slate-700 dark:text-slate-200">📊 All Status</option>
                <option value="paid" className="text-slate-700 dark:text-slate-200">✅ Paid</option>
                <option value="approved" className="text-slate-700 dark:text-slate-200">✅ Approved</option>
                <option value="pending" className="text-slate-700 dark:text-slate-200">⏳ Pending</option>
                <option value="failed" className="text-slate-700 dark:text-slate-200">❌ Failed</option>
                <option value="refunded" className="text-slate-700 dark:text-slate-200">🔄 Refunded</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-4">
                <CreditCard className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No payments found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs xs:text-sm">
                <thead>
                  <tr className="text-left text-[10px] xs:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <th className="px-3 sm:px-6 py-3 font-semibold">Receipt</th>
                    <th className="px-3 py-3 font-semibold hidden sm:table-cell">Student</th>
                    <th className="px-3 py-3 font-semibold hidden md:table-cell">Enrollment</th>
                    <th className="px-3 py-3 font-semibold">Amount</th>
                    <th className="px-3 py-3 font-semibold hidden lg:table-cell">Date</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 sm:px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700/40">
                  {paged.map((p) => {
                    const user = userMap[p.studentId];
                    const enrollment = enrollments.find(e => 
                      e.studentId === p.studentId && 
                      e.courseId === p.courseId &&
                      e.paymentStatus === "approved"
                    );
                    const course = enrollment ? courseMap[enrollment.courseId] : undefined;
                    
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-3 sm:px-6 py-3">
                          <div className="flex items-center gap-2 xs:gap-3">
                            <div className={`h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                              p.paymentStatus === 'paid' || p.paymentStatus === 'approved' 
                                ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : p.paymentStatus === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                            }`}>
                              <CreditCard className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs xs:text-sm max-w-[100px] xs:max-w-[140px]">
                                {p.receiptNumber || "N/A"}
                              </p>
                              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">
                                {user?.name || "Unknown"}
                              </p>
                              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">
                                {formatDate(p.paymentDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden sm:table-cell text-xs">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {user?.name || "Unknown"}
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell text-xs">
                          {enrollment ? (
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                              {course?.title || enrollment.courseId || '—'}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 font-bold text-xs sm:text-sm ${
                            p.paymentStatus === 'paid' || p.paymentStatus === 'approved'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                              : p.paymentStatus === 'pending'
                              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                          }`}>
                            <Tag className="h-3 w-3" />
                            {formatCurrency(p.amount)}
                          </span>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(p.paymentDate)}
                          </div>
                        </td>
                        
                        <td className="px-3 py-3">
                          <StatusBadge label={p.paymentStatus} />
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3">
                          <div className="flex items-center justify-end gap-0.5 xs:gap-1 sm:gap-1.5">
                            <button 
                              onClick={() => setViewPayment(p)}
                              className="p-1.5 xs:p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/20 transition-all"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                            </button>
                            <button
                              onClick={() => setModalPayment(p)}
                              className="p-1.5 xs:p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 border-2 border-transparent hover:border-amber-500/20 transition-all"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ isOpen: true, id: p.id })}
                              className="p-1.5 xs:p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border-2 border-transparent hover:border-rose-500/20 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                            </button>
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
      {/* VIEW PAYMENT MODAL */}
      {/* ============================================ */}
      {viewPayment && (
        <ViewPaymentModal
          payment={viewPayment}
          user={userMap[viewPayment.studentId]}
          enrollment={enrollments.find(e => 
            e.studentId === viewPayment.studentId && 
            e.courseId === viewPayment.courseId &&
            e.paymentStatus === "approved"
          )}
          course={enrollments.find(e => 
            e.studentId === viewPayment.studentId && 
            e.courseId === viewPayment.courseId &&
            e.paymentStatus === "approved"
          ) ? courseMap[enrollments.find(e => 
            e.studentId === viewPayment.studentId && 
            e.courseId === viewPayment.courseId &&
            e.paymentStatus === "approved"
          )?.courseId || ''] : undefined}
          onClose={() => setViewPayment(null)}
        />
      )}

      {/* ============================================ */}
      {/* CREATE/EDIT PAYMENT MODAL */}
      {/* ============================================ */}
      {modalPayment && (
        <PaymentModal
          payment={modalPayment === "new" ? null : modalPayment}
          users={users}
          enrollments={enrollments}
          courses={courses}
          courseMap={courseMap}
          onClose={() => setModalPayment(null)}
          onSuccess={() => {
            showToast(
              modalPayment === "new" 
                ? "Payment added successfully! 💰" 
                : "Payment updated successfully! ✨",
              "success"
            );
          }}
          onError={(message) => {
            showToast(message || "Failed to save payment", "error");
          }}
        />
      )}
    </div>
  );
};

// ============================================
// 📝 PAYMENT MODAL
// ============================================
const PaymentModal: React.FC<{
  payment: Payment | null;
  users: AppUser[];
  enrollments: Enrollment[];
  courses: Course[];
  courseMap: Record<string, Course>;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ payment, users, enrollments, courses, courseMap, onClose, onSuccess, onError }) => {
  const [form, setForm] = useState<Partial<Payment>>(
    payment || {
      studentId: "",
      courseId: "",
      amount: 0,
      paymentStatus: "pending",
      receiptNumber: "",
      transactionId: "",
    }
  );
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Payment, value: any) => setForm(f => ({ ...f, [key]: value }));

  const studentEnrollments = useMemo(() => {
    if (!form.studentId) return [];
    return enrollments.filter(e => e.studentId === form.studentId && e.paymentStatus === "approved");
  }, [enrollments, form.studentId]);

  const handleSave = async () => {
    if (!form.studentId || !form.amount || form.amount <= 0) {
      onError("Student and valid amount are required");
      return;
    }

    setSaving(true);
    try {
      const user = users.find(u => u.id === form.studentId);
      const enrollment = enrollments.find(e => e.id === form.enrollmentId);
      const course = enrollment ? courseMap[enrollment.courseId] : undefined;
      
      const payload = {
        ...form,
        courseId: enrollment?.courseId || form.courseId || "",
        courseName: course?.title || "",
        userName: user?.name || "Unknown",
        userEmail: user?.email || "",
        updatedAt: serverTimestamp(),
      };

      if (payment) {
        await updateDoc(doc(db, "payments", payment.id), payload);
        onSuccess();
        onClose();
      } else {
        const receiptNumber = `REC${Date.now().toString().slice(-9)}`;
        await addDoc(collection(db, "payments"), {
          ...payload,
          receiptNumber: receiptNumber,
          paymentDate: Timestamp.now(),
          createdAt: serverTimestamp(),
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error("Error saving:", err);
      let message = "Failed to save payment. ";
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
              <CreditCard className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm xs:text-base sm:text-lg text-slate-900 dark:text-white">
                {payment ? "Edit Payment" : "Add Payment"}
              </h3>
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400">
                {payment ? "Update payment details" : "Create a new payment record"}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
          <div className="space-y-3 xs:space-y-4">
            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Student <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.studentId}
                onChange={(e) => {
                  set("studentId", e.target.value);
                  set("enrollmentId", "");
                  set("courseId", "");
                }}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              >
                <option value="" className="text-slate-700 dark:text-slate-200">Select student</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="text-slate-700 dark:text-slate-200">
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Enrollment
              </label>
              <select
                value={form.enrollmentId || ""}
                onChange={(e) => {
                  const enrollmentId = e.target.value;
                  const enrollment = enrollments.find(enc => enc.id === enrollmentId);
                  set("enrollmentId", enrollmentId);
                  set("courseId", enrollment?.courseId || "");
                }}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              >
                <option value="" className="text-slate-700 dark:text-slate-200">Select enrollment</option>
                {studentEnrollments.map((e) => {
                  const course = courseMap[e.courseId];
                  return (
                    <option key={e.id} value={e.id} className="text-slate-700 dark:text-slate-200">
                      {course?.title || e.courseId}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={form.amount || ""}
                onChange={(e) => set("amount", e.target.value ? Number(e.target.value) : 0)}
                placeholder="Enter amount"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3 xs:space-y-4">
            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Status
              </label>
              <select
                value={form.paymentStatus}
                onChange={(e) => set("paymentStatus", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              >
                <option value="pending">⏳ Pending</option>
                <option value="paid">✅ Paid</option>
                <option value="approved">✅ Approved</option>
                <option value="failed">❌ Failed</option>
                <option value="refunded">🔄 Refunded</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Transaction ID
              </label>
              <input
                value={form.transactionId || ""}
                onChange={(e) => set("transactionId", e.target.value)}
                placeholder="Enter transaction ID"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Remarks
              </label>
              <textarea
                value={form.remarks || ""}
                onChange={(e) => set("remarks", e.target.value)}
                placeholder="Add remarks..."
                rows={2}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors resize-none"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 mt-4 xs:mt-5 sm:mt-6 pt-4 xs:pt-5 sm:pt-6 border-t-2 border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full xs:w-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors order-2 xs:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.studentId || !form.amount}
            className="w-full xs:w-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed order-1 xs:order-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/30 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {payment ? "Update" : "Create"}
                <Sparkles className="h-3 w-3 xs:h-4 xs:w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;