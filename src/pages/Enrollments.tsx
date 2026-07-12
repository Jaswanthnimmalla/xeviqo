// src/pages/Enrollments.tsx
import React, { useMemo, useState } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Users, CheckCircle2, Clock, GraduationCap, Search, Trash2, Eye, X } from "lucide-react";

import { db } from "../firebase/firebase"; // ✅ Fixed import path
import { useCollection, toLookupMap } from "../lib/useCollection";
import { formatCurrency, formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton, Pagination } from "../components/ui/TableHelpers";
import type { Enrollment, AppUser, Course, Payment } from "../types";

const PAGE_SIZE = 8;

const Enrollments: React.FC = () => {
  const { data: enrollments, loading } = useCollection<Enrollment>("enrollments");
  const { data: students } = useCollection<AppUser>("users");
  const { data: courses } = useCollection<Course>("courses");
  const { data: payments } = useCollection<Payment>("payments");

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Enrollment | null>(null);

  const studentMap = useMemo(() => toLookupMap(students), [students]);
  const courseMap = useMemo(() => toLookupMap(courses), [courses]);

  const amountByEnrollment = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.enrollmentId) map[p.enrollmentId] = (map[p.enrollmentId] || 0) + (p.amount || 0);
    });
    return map;
  }, [payments]);

  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const pendingCount = enrollments.filter((e) => e.status === "pending").length;
  const completedCount = enrollments.filter((e) => e.completionStatus === "completed").length;

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const student = studentMap[e.studentId];
      const course = courseMap[e.courseId];
      const matchesSearch =
        !search ||
        student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        student?.email?.toLowerCase().includes(search.toLowerCase()) ||
        course?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "all" || e.courseId === courseFilter;
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || e.paymentStatus === paymentFilter;
      return matchesSearch && matchesCourse && matchesStatus && matchesPayment;
    });
  }, [enrollments, studentMap, courseMap, search, courseFilter, statusFilter, paymentFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enrollment record?")) return;
    await deleteDoc(doc(db, "enrollments", id));
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Enrollments</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Dashboard &gt; Enrollments</p>
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Total Enrollments" value={enrollments.length} icon={Users} color="violet" loading={loading} />
        <StatCard label="Active" value={activeCount} icon={CheckCircle2} color="blue" loading={loading} />
        <StatCard label="Pending" value={pendingCount} icon={Clock} color="amber" loading={loading} />
        <StatCard label="Completed" value={completedCount} icon={GraduationCap} color="green" loading={loading} />
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] overflow-hidden">
        {/* Filters - Fully Responsive */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-700/60">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student, course..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">Payment</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No enrollments found" subtitle="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium">Student</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Course</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden lg:table-cell">Batch</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden md:table-cell">Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Progress</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden sm:table-cell">Payment</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {paged.map((e) => {
                  const student = studentMap[e.studentId];
                  const course = courseMap[e.courseId];
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Student */}
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0">
                            {student?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm">
                              {student?.name || "Unknown"}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                              {student?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Course */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                        {course?.title || e.courseId}
                      </td>
                      
                      {/* Batch - Hidden on tablet/mobile */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell text-xs sm:text-sm">
                        {e.batch || "—"}
                      </td>
                      
                      {/* Date - Hidden on mobile */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell text-xs sm:text-sm">
                        {formatDate(e.enrollmentDate)}
                      </td>
                      
                      {/* Progress */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-1 sm:gap-2 w-20 sm:w-28">
                          <div className="h-1 sm:h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#6C63FF] transition-all"
                              style={{ width: `${e.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 min-w-[30px]">
                            {e.progress || 0}%
                          </span>
                        </div>
                      </td>
                      
                      {/* Payment - Hidden on mobile */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                        <StatusBadge label={e.paymentStatus} />
                      </td>
                      
                      {/* Status */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <StatusBadge label={e.status} />
                      </td>
                      
                      {/* Actions */}
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button
                            onClick={() => setDetail(e)}
                            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <EnrollmentDetailModal
          enrollment={detail}
          student={studentMap[detail.studentId]}
          course={courseMap[detail.courseId]}
          amountPaid={amountByEnrollment[detail.id] || 0}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
};

const EnrollmentDetailModal: React.FC<{
  enrollment: Enrollment;
  student?: AppUser;
  course?: Course;
  amountPaid: number;
  onClose: () => void;
}> = ({ enrollment, student, course, amountPaid, onClose }) => {
  const [status, setStatus] = useState(enrollment.status);
  const [progress, setProgress] = useState(enrollment.progress || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "enrollments", enrollment.id), {
        status,
        progress,
        updatedAt: serverTimestamp(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">Enrollment Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-2 text-xs sm:text-sm mb-4">
          <p>
            <span className="text-slate-500 dark:text-slate-400">Student: </span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{student?.name || "—"}</span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Course: </span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{course?.title || "—"}</span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Batch: </span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{enrollment.batch || "—"}</span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Amount Paid: </span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(amountPaid)}</span>
          </p>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">Progress ({progress}%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#6C63FF]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 order-1 sm:order-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Enrollments;