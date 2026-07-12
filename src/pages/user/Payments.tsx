// src/pages/user/Payments.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, CheckCircle, Clock, AlertCircle, DollarSign,
  Calendar, ChevronRight, Search, Filter, Download,
  Eye, ArrowUpRight, Loader2, Receipt, User, Circle,
  X, RefreshCw, Wallet, TrendingUp, BookOpen, GraduationCap
} from "lucide-react";
import { collection, query, where, orderBy, getDocs, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatCurrency } from "../../lib/format";

interface Payment {
  id: string;
  amount: number;
  courseId: string;
  courseName: string;
  createdAt: any;
  paymentDate: any;
  paymentMethod: string;
  paymentStatus: "pending" | "approved" | "rejected" | "refunded";
  transactionId: string;
  screenshotUrl?: string;
  remarks?: string;
  receiptNumber?: string;
  studentId: string;
  userName: string;
  userEmail: string;
  updatedAt: any;
  enrollmentId?: string;
  approvedAt?: any;
  rejectedAt?: any;
  approvedBy?: string;
  rejectedBy?: string;
  rejectReason?: string;
}

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "refunded">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID from localStorage
  const userId = localStorage.getItem("userId") || "";

  // ✅ Real-time listener with immediate updates
  useEffect(() => {
    if (!userId) {
      console.warn("No userId found in localStorage");
      setLoading(false);
      setError("Please login to view your payments");
      return;
    }

    console.log("Setting up real-time listener for userId:", userId);
    setLoading(true);
    setError(null);
    
    try {
      // Create query - removed orderBy to avoid index issues, we'll sort client-side
      const paymentsRef = collection(db, "payments");
      const q = query(
        paymentsRef,
        where("studentId", "==", userId)
      );

      // ✅ Real-time listener with immediate updates
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log("📦 Snapshot received, size:", snapshot.size);
          
          if (snapshot.empty) {
            console.log("No payments found for user:", userId);
            setPayments([]);
            setLoading(false);
            setError(null);
            return;
          }

          // Map and sort data
          const paymentsData = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log("📄 Payment doc:", doc.id, data);
            return {
              id: doc.id,
              ...data
            } as Payment;
          });

          // Sort by createdAt descending (newest first)
          const sortedPayments = paymentsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          
          console.log("✅ Payments loaded:", sortedPayments.length);
          setPayments(sortedPayments);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error("❌ Error in real-time listener:", error);
          
          // Check if it's an index error
          if (error.message?.includes("index")) {
            setError("Please create the required Firestore index. Click the link in console to create it.");
          } else {
            setError(`Failed to load payments: ${error.message}`);
          }
          setLoading(false);
          
          // Try fallback without orderBy
          fetchPaymentsWithoutOrder(userId);
        }
      );

      // Cleanup listener on unmount
      return () => {
        console.log("🧹 Cleaning up real-time listener");
        unsubscribe();
      };
    } catch (error) {
      console.error("❌ Error setting up listener:", error);
      setError("Failed to setup payment listener");
      setLoading(false);
      
      // Try fallback without orderBy
      fetchPaymentsWithoutOrder(userId);
    }
  }, [userId]);

  // Fallback function to fetch payments without orderBy
  const fetchPaymentsWithoutOrder = async (userId: string) => {
    try {
      console.log("🔄 Fallback: Fetching payments without orderBy");
      const paymentsRef = collection(db, "payments");
      const q = query(
        paymentsRef,
        where("studentId", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const paymentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Payment[];
        
        // Sort client-side
        const sortedPayments = paymentsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        setPayments(sortedPayments);
        console.log("✅ Fallback: Payments loaded:", sortedPayments.length);
      } else {
        setPayments([]);
        console.log("ℹ️ Fallback: No payments found");
      }
    } catch (fallbackError) {
      console.error("❌ Fallback fetch failed:", fallbackError);
      setError("Unable to load payments. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filter !== "all" && payment.paymentStatus !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.courseName?.toLowerCase().includes(search) ||
        payment.transactionId?.toLowerCase().includes(search) ||
        payment.receiptNumber?.toLowerCase().includes(search) ||
        payment.userName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: payments.length,
    approved: payments.filter(p => p.paymentStatus === "approved").length,
    pending: payments.filter(p => p.paymentStatus === "pending").length,
    rejected: payments.filter(p => p.paymentStatus === "rejected").length,
    totalAmount: payments
      .filter(p => p.paymentStatus === "approved")
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config = {
      approved: {
        bg: "bg-green-100 dark:bg-green-500/20",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-200 dark:border-green-500/30",
        icon: CheckCircle,
        label: "Approved ✅"
      },
      pending: {
        bg: "bg-amber-100 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/30",
        icon: Clock,
        label: "Pending ⏳"
      },
      rejected: {
        bg: "bg-red-100 dark:bg-red-500/20",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-500/30",
        icon: AlertCircle,
        label: "Rejected ❌"
      },
      refunded: {
        bg: "bg-blue-100 dark:bg-blue-500/20",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-500/30",
        icon: ArrowUpRight,
        label: "Refunded 🔄"
      }
    };

    const { bg, text, border, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "N/A";
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return "N/A";
    }
  };

  // Payment Card component
  const PaymentCard: React.FC<{ payment: Payment }> = ({ payment }) => {
    const isApproved = payment.paymentStatus === "approved";
    const isPending = payment.paymentStatus === "pending";
    const isRejected = payment.paymentStatus === "rejected";

    return (
      <div 
        className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm hover:shadow-md border p-4 transition-all duration-300 cursor-pointer ${
          isApproved ? 'border-green-200 dark:border-green-500/30 hover:border-green-300' :
          isPending ? 'border-amber-200 dark:border-amber-500/30 hover:border-amber-300' :
          isRejected ? 'border-red-200 dark:border-red-500/30 hover:border-red-300' :
          'border-slate-200 dark:border-slate-700/60 hover:border-[#6C63FF]/30'
        }`}
        onClick={() => {
          setSelectedPayment(payment);
          setShowModal(true);
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
              isApproved ? "bg-green-100 dark:bg-green-500/20" :
              isPending ? "bg-amber-100 dark:bg-amber-500/20" :
              "bg-red-100 dark:bg-red-500/20"
            }`}>
              {isApproved ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : isPending ? (
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                {payment.courseName || "Course Enrollment"}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={payment.paymentStatus} />
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  {payment.receiptNumber || "No receipt"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatRelativeTime(payment.paymentDate)}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              {payment.paymentMethod || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <div className="text-right">
              <span className={`text-lg font-bold ${
                isApproved ? 'text-green-600 dark:text-green-400' :
                isPending ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(payment.amount || 0)}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-[#6C63FF] animate-spin" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading your payments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-8 w-8 text-[#6C63FF]" />
              My Payments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track all your course payments and enrollment history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/user/courses")}
              className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5b53e6] text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              Browse Courses
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Payments</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-green-200 dark:border-green-500/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-amber-200 dark:border-amber-500/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-[#6C63FF]/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Spent</p>
          <p className="text-2xl font-bold text-[#6C63FF] mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/60 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course, transaction ID, or receipt..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2.5 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved ✅</option>
              <option value="pending">Pending ⏳</option>
              <option value="rejected">Rejected ❌</option>
              <option value="refunded">Refunded 🔄</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <CreditCard className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || filter !== "all" ? "No payments found" : "No payments yet"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm || filter !== "all" 
              ? "Try adjusting your search or filters"
              : "You haven't made any payments yet. Browse our courses and enroll today!"}
          </p>
          {!searchTerm && filter === "all" && (
            <button
              onClick={() => navigate("/user/courses")}
              className="mt-4 inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5b53e6] text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            >
              Browse Courses
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => {
            setShowModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Detail Modal
const PaymentDetailModal: React.FC<{
  payment: Payment;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  const navigate = useNavigate();
  const isApproved = payment.paymentStatus === "approved";
  const isPending = payment.paymentStatus === "pending";
  const isRejected = payment.paymentStatus === "rejected";

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      approved: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400", label: "Approved ✅" },
      pending: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", label: "Pending ⏳" },
      rejected: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-700 dark:text-red-400", label: "Rejected ❌" },
      refunded: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", label: "Refunded 🔄" }
    };
    const { bg, text, label } = config[status as keyof typeof config] || config.pending;
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>{label}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8 border border-slate-200 dark:border-slate-700/60">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isApproved ? "bg-green-100 dark:bg-green-500/20" :
              isPending ? "bg-amber-100 dark:bg-amber-500/20" :
              "bg-red-100 dark:bg-red-500/20"
            }`}>
              {isApproved ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : isPending ? (
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Payment Details
              </h3>
              <StatusBadge status={payment.paymentStatus} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Payment Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amount || 0)}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Course</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{payment.courseName}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Transaction ID</p>
            <p className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200 truncate">{payment.transactionId}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Receipt Number</p>
            <p className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">{payment.receiptNumber || "N/A"}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Payment Method</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{payment.paymentMethod || "N/A"}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Payment Date</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(payment.paymentDate)}</p>
          </div>
        </div>

        {/* Approval/Rejection Info */}
        {isApproved && payment.approvedAt && (
          <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30 mb-4">
            <p className="text-xs text-green-600 dark:text-green-400">✅ Approved</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Approved on {formatDate(payment.approvedAt)}
              {payment.approvedBy && ` by ${payment.approvedBy}`}
            </p>
          </div>
        )}

        {isRejected && payment.rejectedAt && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/30 mb-4">
            <p className="text-xs text-red-600 dark:text-red-400">❌ Rejected</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Rejected on {formatDate(payment.rejectedAt)}
              {payment.rejectedBy && ` by ${payment.rejectedBy}`}
            </p>
            {payment.rejectReason && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Reason: {payment.rejectReason}
              </p>
            )}
          </div>
        )}

        {/* Screenshot */}
        {payment.screenshotUrl && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Payment Screenshot</p>
            <img 
              src={payment.screenshotUrl} 
              alt="Payment Screenshot" 
              className="rounded-xl border border-slate-200 dark:border-slate-700 max-h-64 object-contain w-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Remarks */}
        {payment.remarks && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40 mb-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Remarks</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{payment.remarks}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/40 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p>Created: {formatDate(payment.createdAt)}</p>
          </div>
          <div>
            <p>Updated: {formatDate(payment.updatedAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
          {isPending && (
            <button
              onClick={() => {
                onClose();
                navigate(`/user/payment/${payment.courseId}`);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white font-medium transition-colors text-center"
            >
              Retry Payment
            </button>
          )}
          {isApproved && (
            <button
              onClick={() => {
                onClose();
                navigate(`/user/my-courses`);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors text-center flex items-center justify-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Access Course
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;