// src/pages/ApprovePayments.tsx (Fixed - handle undefined paymentId)
import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Filter, Eye, CheckCircle, XCircle, Clock, 
  Download, Upload, FileText, Image, Trash2, X,
  ChevronDown, ChevronUp, Calendar, DollarSign, User,
  CreditCard, AlertCircle, RefreshCw, Camera, Link,
  ArrowUpDown, MoreVertical, Shield, FileCheck, Ban,
  Check, ChevronLeft, ChevronRight, Loader2, Cloud
} from "lucide-react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useCollection } from "../lib/useCollection";
import { formatCurrency, formatDate } from "../lib/format";
import StatusBadge from "../components/ui/StatusBadge";
import { uploadToCloudinary } from "../lib/cloudinary";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "approved" | "rejected";
  transactionId?: string;
  qrCodeImage?: string;
  screenshotUrl?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  rejectedAt?: any;
  approvedBy?: string;
  rejectedBy?: string;
  studentId?: string;
}

interface QRCodeData {
  id: string;
  imageUrl: string;
  uploadedAt: any;
  updatedAt: any;
  isActive: boolean;
  description?: string;
  fileName?: string;
  fileSize?: number;
  source?: string;
  cloudinaryPublicId?: string;
}

const PAGE_SIZE = 10;

const ApprovePayments: React.FC = () => {
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>("payments");
  const { data: qrCodesData, loading: qrLoading } = useCollection<QRCodeData>("qrCodes");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUploadQRModal, setShowUploadQRModal] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount-high" | "amount-low">("newest");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // QR Code
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrDescription, setQrDescription] = useState("");
  const [uploadingQR, setUploadingQR] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Payment Action
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Bulk Actions
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showBulkAction, setShowBulkAction] = useState(false);

  // Real-time listener for QR codes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "qrCodes"), () => {
      setRefreshTrigger(prev => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  const refreshQRCodes = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const activeQR = useMemo(() => {
    return qrCodesData?.find(q => q.isActive === true) || null;
  }, [qrCodesData, refreshTrigger]);

  useEffect(() => {
    if (qrFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(qrFile);
    } else {
      setPreviewUrl(null);
    }
  }, [qrFile]);

  const filteredPayments = useMemo(() => {
    if (!payments) return [];

    let filtered = [...payments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.userName?.toLowerCase().includes(term) ||
        p.userEmail?.toLowerCase().includes(term) ||
        p.courseName?.toLowerCase().includes(term) ||
        p.transactionId?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.paymentStatus === statusFilter);
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(p => {
        if (!p.createdAt) return false;
        const created = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return created >= startDate;
      });
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(p => {
        if (!p.createdAt) return false;
        const created = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return created <= endDate;
      });
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return bDate.getTime() - aDate.getTime();
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return aDate.getTime() - bDate.getTime();
        });
        break;
      case "amount-high":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-low":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    return filtered;
  }, [payments, searchTerm, statusFilter, dateRange, sortBy]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, currentPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredPayments.length / PAGE_SIZE) || 1);
  }, [filteredPayments]);

  const stats = useMemo(() => {
    if (!payments) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      total: payments.length,
      pending: payments.filter(p => p.paymentStatus === "pending").length,
      approved: payments.filter(p => p.paymentStatus === "approved").length,
      rejected: payments.filter(p => p.paymentStatus === "rejected").length,
    };
  }, [payments]);

  // ✅ UPLOAD QR CODE
  const handleUploadQR = async () => {
    if (!qrFile) {
      alert("Please select a QR code image to upload.");
      return;
    }

    setUploadingQR(true);
    setUploadProgress(10);
    
    try {
      console.log("📤 Starting QR upload to Cloudinary...");
      console.log("File:", qrFile.name, qrFile.size, "bytes");
      
      setUploadProgress(30);
      const imageUrl = await uploadToCloudinary(qrFile);
      console.log("✅ Cloudinary upload complete:", imageUrl);
      
      setUploadProgress(50);

      console.log("📝 Creating Firestore document...");
      const qrDocRef = doc(collection(db, "qrCodes"));
      
      const qrData = {
        id: qrDocRef.id,
        imageUrl: imageUrl,
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        description: qrDescription || "UPI QR Code for Payments",
        fileName: qrFile.name,
        fileSize: qrFile.size,
        source: "Cloudinary",
      };

      console.log("Saving to Firestore:", qrData);
      await setDoc(qrDocRef, qrData);
      console.log("✅ Firestore document created:", qrDocRef.id);
      
      setUploadProgress(75);

      console.log("🔄 Deactivating old QR codes...");
      const qrSnapshot = await getDocs(collection(db, "qrCodes"));
      const batch = writeBatch(db);
      
      qrSnapshot.docs.forEach((doc) => {
        if (doc.id !== qrDocRef.id) {
          batch.update(doc.ref, { 
            isActive: false,
            updatedAt: serverTimestamp()
          });
        }
      });
      
      await batch.commit();
      console.log("✅ Old QR codes deactivated");
      
      setUploadProgress(100);

      setQrFile(null);
      setPreviewUrl(null);
      setQrDescription("");
      setShowUploadQRModal(false);
      
      refreshQRCodes();
      
      alert("✅ QR Code uploaded successfully to Cloudinary!");
      
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      let errorMsg = "❌ Failed to upload QR code. ";
      if (error.message && error.message.includes("Cloudinary")) {
        errorMsg += "Cloudinary upload failed. Please check your Cloudinary configuration.";
      } else if (error.message) {
        errorMsg += error.message;
      } else {
        errorMsg += "Please try again.";
      }
      
      alert(errorMsg);
    } finally {
      setUploadingQR(false);
      setUploadProgress(0);
    }
  };

  // ✅ DELETE QR CODE
  const handleDeleteQR = async (qrId: string) => {
    if (!confirm("Are you sure you want to delete this QR code from the system?")) return;

    try {
      console.log("🗑️ Deleting QR code from Firestore...");
      await deleteDoc(doc(db, "qrCodes", qrId));
      refreshQRCodes();
      alert("✅ QR Code removed from system!");
    } catch (error) {
      console.error("Error deleting QR:", error);
      alert("❌ Failed to delete QR code.");
    }
  };

  // ✅ CREATE ENROLLMENT FUNCTION - FIXED
  const createEnrollment = async (payment: Payment, paymentId: string) => {
    try {
      // Get the student ID - try multiple sources
      const studentId = payment.studentId || payment.userId || payment.userEmail || "unknown";
      
      console.log("📝 Creating enrollment for:", payment.userName);
      console.log("Course ID:", payment.courseId);
      console.log("Student ID:", studentId);
      console.log("Payment ID:", paymentId);
      
      // Validate required fields
      if (!payment.courseId) {
        throw new Error("Course ID is missing");
      }
      
      if (!studentId || studentId === "unknown") {
        throw new Error("Student ID is missing");
      }

      // Check if enrollment already exists
      const enrollmentQuery = query(
        collection(db, "enrollments"),
        where("studentId", "==", studentId),
        where("courseId", "==", payment.courseId)
      );
      const existingEnrollment = await getDocs(enrollmentQuery);
      
      if (!existingEnrollment.empty) {
        console.log("⚠️ Enrollment already exists for this student and course");
        // Update existing enrollment with payment info
        const existingDoc = existingEnrollment.docs[0];
        await updateDoc(doc(db, "enrollments", existingDoc.id), {
          paymentStatus: "approved",
          paymentId: paymentId,
          updatedAt: serverTimestamp()
        });
        return existingDoc.id;
      }

      // ✅ Create new enrollment document - NO undefined fields
      const enrollmentData = {
        studentId: studentId,
        studentName: payment.userName || "Unknown User",
        studentEmail: payment.userEmail || "unknown@email.com",
        courseId: payment.courseId,
        courseName: payment.courseName || "Unknown Course",
        paymentId: paymentId || "unknown",
        amount: payment.amount || 0,
        enrollmentDate: serverTimestamp(),
        completionStatus: "in-progress",
        progress: 0,
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentStatus: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: "admin",
        status: "active"
      };

      console.log("📝 Enrollment data:", enrollmentData);
      
      const enrollmentRef = doc(collection(db, "enrollments"));
      await setDoc(enrollmentRef, enrollmentData);
      console.log("✅ Enrollment created with ID:", enrollmentRef.id);
      
      return enrollmentRef.id;
    } catch (error) {
      console.error("❌ Error creating enrollment:", error);
      throw error;
    }
  };

  // ✅ HANDLE PAYMENT ACTION (Approve/Reject)
  const handlePaymentAction = async (paymentId: string, action: "approve" | "reject") => {
    setProcessingPayment(true);
    try {
      // Get the payment document first
      const paymentRef = doc(db, "payments", paymentId);
      const paymentDoc = await getDoc(paymentRef);
      
      if (!paymentDoc.exists()) {
        alert("❌ Payment not found!");
        setProcessingPayment(false);
        return;
      }

      const paymentData = paymentDoc.data() as Payment;
      
      // Update payment status
      const updates: any = {
        paymentStatus: action === "approve" ? "approved" : "rejected",
        updatedAt: serverTimestamp(),
      };

      if (action === "approve") {
        updates.approvedAt = serverTimestamp();
        updates.approvedBy = "admin";
      } else {
        updates.rejectedAt = serverTimestamp();
        updates.rejectedBy = "admin";
        updates.rejectReason = rejectReason || "Payment rejected by admin";
      }

      await updateDoc(paymentRef, updates);
      console.log(`✅ Payment ${action}d:`, paymentId);

      // ✅ If approved, create enrollment
      if (action === "approve") {
        try {
          await createEnrollment(paymentData, paymentId);
        } catch (enrollmentError) {
          console.error("❌ Enrollment creation error:", enrollmentError);
          alert("⚠️ Payment approved but enrollment creation failed: " + (enrollmentError instanceof Error ? enrollmentError.message : "Unknown error"));
          setProcessingPayment(false);
          return;
        }
      }
      
      setShowActionDialog(null);
      setRejectReason("");
      alert(`✅ Payment ${action === "approve" ? "approved" : "rejected"} successfully!`);
      
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      alert("❌ Failed to process payment: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setProcessingPayment(false);
    }
  };

  // ✅ BULK ACTION
  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedPayments.length === 0) return;
    if (!confirm(`Are you sure you want to ${action} ${selectedPayments.length} payments?`)) return;

    setProcessingPayment(true);
    try {
      const batch = writeBatch(db);
      const enrollmentPromises = [];
      
      for (const id of selectedPayments) {
        const paymentRef = doc(db, "payments", id);
        const paymentDoc = await getDoc(paymentRef);
        
        if (!paymentDoc.exists()) continue;
        
        const paymentData = paymentDoc.data() as Payment;
        
        const updates: any = {
          paymentStatus: action === "approve" ? "approved" : "rejected",
          updatedAt: serverTimestamp(),
        };
        if (action === "approve") {
          updates.approvedAt = serverTimestamp();
          updates.approvedBy = "admin";
          // Create enrollment for approved payment
          enrollmentPromises.push(createEnrollment(paymentData, id));
        } else {
          updates.rejectedAt = serverTimestamp();
          updates.rejectedBy = "admin";
          updates.rejectReason = "Bulk rejection by admin";
        }
        batch.update(paymentRef, updates);
      }

      await batch.commit();
      
      // Wait for all enrollments to be created
      if (action === "approve") {
        try {
          await Promise.all(enrollmentPromises);
        } catch (enrollmentError) {
          console.error("❌ Some enrollments failed:", enrollmentError);
          alert("⚠️ Some enrollments failed to create. Please check the enrollments collection.");
        }
      }
      
      setSelectedPayments([]);
      setShowBulkAction(false);
      alert(`✅ ${selectedPayments.length} payments ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error in bulk action:", error);
      alert("❌ Failed to process bulk action.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <StatusBadge label="Approved" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />;
      case "rejected":
        return <StatusBadge label="Rejected" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" />;
      default:
        return <StatusBadge label="Pending" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />;
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-[#6C63FF]" />
            Approve Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage and approve student payment requests
          </p>
        </div>
        <button
          onClick={() => setShowUploadQRModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          Upload QR Code
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total</span>
            <div className="h-8 w-8 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Pending</span>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Approved</span>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Rejected</span>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* QR Code Status */}
      {activeQR && (
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                <img src={activeQR.imageUrl} alt="Active QR" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Active QR Code</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Uploaded: {formatDate(activeQR.uploadedAt)}
                </p>
                {activeQR.description && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">{activeQR.description}</p>
                )}
                {activeQR.fileName && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    File: {activeQR.fileName}
                  </p>
                )}
                {activeQR.source && (
                  <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
                    📸 {activeQR.source}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(activeQR.imageUrl, '_blank')}
                className="text-xs text-[#6C63FF] hover:underline"
              >
                View Full Size
              </button>
              <button
                onClick={() => handleDeleteQR(activeQR.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!activeQR && !qrLoading && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 text-center">
          <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            No active QR code found. Upload a QR code for students to scan.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/60">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, course, or transaction..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
          <div className="flex-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <button
            onClick={() => setDateRange({ start: "", end: "" })}
            className="text-sm text-[#6C63FF] hover:underline"
          >
            Clear Dates
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPayments.length > 0 && (
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-3 sm:p-4 shadow-sm border border-[#6C63FF]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {selectedPayments.length} payment{selectedPayments.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleBulkAction("approve")}
              disabled={processingPayment}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Approve All
            </button>
            <button
              onClick={() => handleBulkAction("reject")}
              disabled={processingPayment}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Reject All
            </button>
            <button
              onClick={() => setSelectedPayments([])}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === paginatedPayments.length && paginatedPayments.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPayments(paginatedPayments.map(p => p.id));
                      } else {
                        setSelectedPayments([]);
                      }
                    }}
                    className="rounded border-slate-300 dark:border-slate-600 text-[#6C63FF] focus:ring-[#6C63FF]"
                  />
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">User</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden md:table-cell">Course</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-right">Amount</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden lg:table-cell">Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {paymentsLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 text-[#6C63FF] animate-spin" />
                      <span className="text-slate-500 dark:text-slate-400">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400">No payments found</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPayments([...selectedPayments, payment.id]);
                          } else {
                            setSelectedPayments(selectedPayments.filter(id => id !== payment.id));
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-600 text-[#6C63FF] focus:ring-[#6C63FF]"
                        disabled={payment.paymentStatus !== "pending"}
                      />
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {payment.userName?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm">
                            {payment.userName || "Unknown"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                            {payment.userEmail || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                      <p className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {payment.courseName || "Unknown Course"}
                      </p>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(payment.createdAt)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      {getStatusBadge(payment.paymentStatus)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        {payment.paymentStatus === "pending" && (
                          <>
                            <button
                              onClick={() => setShowActionDialog({ id: payment.id, action: "approve" })}
                              className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => setShowActionDialog({ id: payment.id, action: "reject" })}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!paymentsLoading && filteredPayments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-700/60">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredPayments.length)} of {filteredPayments.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#6C63FF] text-white text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Details</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Transaction #{selectedPayment.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setShowPaymentDetails(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">User</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedPayment.userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPayment.userEmail}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Course</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedPayment.courseName}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                  {getStatusBadge(selectedPayment.paymentStatus)}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Payment Method</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedPayment.paymentMethod || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Transaction ID</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedPayment.transactionId || "N/A"}</p>
                </div>
              </div>

              {selectedPayment.screenshotUrl && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Payment Screenshot</p>
                  <img 
                    src={selectedPayment.screenshotUrl} 
                    alt="Payment Screenshot" 
                    className="max-h-48 rounded-lg object-contain mx-auto cursor-pointer"
                    onClick={() => window.open(selectedPayment.screenshotUrl, '_blank')}
                  />
                </div>
              )}

              {selectedPayment.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedPayment.notes}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-700/60">
                {selectedPayment.paymentStatus === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setShowPaymentDetails(false);
                        setShowActionDialog({ id: selectedPayment.id, action: "approve" });
                      }}
                      className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                    >
                      Approve Payment
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentDetails(false);
                        setShowActionDialog({ id: selectedPayment.id, action: "reject" });
                      }}
                      className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Reject Payment
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowPaymentDetails(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {showActionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                showActionDialog.action === "approve" 
                  ? "bg-green-100 dark:bg-green-500/20" 
                  : "bg-red-100 dark:bg-red-500/20"
              }`}>
                {showActionDialog.action === "approve" ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {showActionDialog.action === "approve" ? "Approve Payment" : "Reject Payment"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {showActionDialog.action === "approve" 
                    ? "This will confirm the payment and enroll the student" 
                    : "This will reject the payment request"}
                </p>
              </div>
            </div>

            {showActionDialog.action === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Why are you rejecting this payment?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 resize-none"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowActionDialog(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePaymentAction(showActionDialog.id, showActionDialog.action)}
                disabled={processingPayment}
                className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  showActionDialog.action === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } disabled:opacity-50`}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {showActionDialog.action === "approve" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {showActionDialog.action === "approve" ? "Approve" : "Reject"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload QR Code Modal */}
      {showUploadQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[#6C63FF]" />
                Upload QR Code
              </h3>
              <button onClick={() => setShowUploadQRModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  QR Code Image <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#6C63FF]/10 file:text-[#6C63FF] hover:file:bg-[#6C63FF]/20"
                  />
                </div>
                {qrFile && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Selected: {qrFile.name} ({(qrFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {previewUrl && (
                <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                  <img 
                    src={previewUrl} 
                    alt="QR Code Preview" 
                    className="w-full h-32 object-contain bg-slate-50 dark:bg-slate-800/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  value={qrDescription}
                  onChange={(e) => setQrDescription(e.target.value)}
                  placeholder="e.g., UPI QR Code for Payments"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                />
              </div>

              {uploadingQR && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {uploadProgress < 50 ? 'Uploading to Cloudinary...' : 'Saving to Firestore...'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#6C63FF] transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowUploadQRModal(false);
                    setQrFile(null);
                    setPreviewUrl(null);
                    setQrDescription("");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium"
                  disabled={uploadingQR}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadQR}
                  disabled={uploadingQR || !qrFile}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadingQR ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      Upload to Cloudinary
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                Images are stored on Cloudinary with folder: <strong>qrcodes</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovePayments;