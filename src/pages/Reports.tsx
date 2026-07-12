// src/pages/Reports.tsx
// Report history is logged to a new `reports` collection (type, date range,
// record count, generatedBy, createdAt) so admins can see what's been run.
import React, { useMemo, useState } from "react";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { FileBarChart, Users, Wallet, GraduationCap, BookOpen, Award, Download, Clock } from "lucide-react";

import { db } from "../firebase/firebase"; // ✅ Fixed import path
import { useCollection } from "../lib/useCollection";
import { useCurrentAdmin } from "../lib/useCurrentAdmin";
import { formatDate, formatCurrency } from "../lib/format";
import { EmptyState } from "../components/ui/TableHelpers";
import type {
  AppUser,
  Course,
  Enrollment,
  Payment,
  Certificate,
  ReportRecord,
} from "../types";

const REPORT_TYPES = [
  { id: "students", label: "Students Report", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  { id: "revenue", label: "Revenue Report", icon: Wallet, color: "text-amber-500 bg-amber-500/10" },
  { id: "enrollments", label: "Enrollments Report", icon: GraduationCap, color: "text-green-500 bg-green-500/10" },
  { id: "courses", label: "Course Performance", icon: BookOpen, color: "text-violet-500 bg-violet-500/10" },
  { id: "certificates", label: "Certificates Report", icon: Award, color: "text-pink-500 bg-pink-500/10" },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]["id"];

const Reports: React.FC = () => {
  const { data: students } = useCollection<AppUser>("users");
  const { data: courses } = useCollection<Course>("courses");
  const { data: enrollments } = useCollection<Enrollment>("enrollments");
  const { data: payments } = useCollection<Payment>("payments");
  const { data: certificates } = useCollection<Certificate>("certificates");
  const { data: history } = useCollection<ReportRecord>("reports");
  const admin = useCurrentAdmin();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState<ReportType | null>(null);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)).slice(0, 10),
    [history]
  );

  const inRange = (ts?: any) => {
    if (!ts) return !dateFrom && !dateTo;
    const time = ts.toDate().getTime();
    if (dateFrom && time < new Date(dateFrom).getTime()) return false;
    if (dateTo && time > new Date(dateTo).getTime() + 86400000) return false;
    return true;
  };

  const downloadCSV = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildReport = (type: ReportType) => {
    switch (type) {
      case "students": {
        const rows = students.filter((s) => s.role === "student" && inRange(s.createdAt));
        return {
          rows: [
            ["Name", "Email", "Phone", "Status", "Join Date"],
            ...rows.map((s) => [s.name, s.email, s.phone || "", s.status, formatDate(s.createdAt)]),
          ],
          count: rows.length,
        };
      }
      case "revenue": {
        const rows = payments.filter((p) => p.paymentStatus === "paid" && inRange(p.paymentDate));
        return {
          rows: [
            ["Receipt No.", "Amount", "Method", "Transaction ID", "Date"],
            ...rows.map((p) => [p.receiptNumber || "", String(p.amount), p.paymentMethod || "", p.transactionId || "", formatDate(p.paymentDate)]),
          ],
          count: rows.length,
        };
      }
      case "enrollments": {
        const rows = enrollments.filter((e) => inRange(e.enrollmentDate));
        return {
          rows: [
            ["Student ID", "Course ID", "Batch", "Status", "Payment Status", "Enrollment Date"],
            ...rows.map((e) => [e.studentId, e.courseId, e.batch || "", e.status, e.paymentStatus, formatDate(e.enrollmentDate)]),
          ],
          count: rows.length,
        };
      }
      case "courses": {
        const rows = courses.filter((c) => inRange(c.createdAt));
        return {
          rows: [
            ["Title", "Category", "Trainer", "Students", "Price", "Status"],
            ...rows.map((c) => [c.title, c.category, c.trainerName || "", String(c.totalStudents || 0), String(c.price), c.status]),
          ],
          count: rows.length,
        };
      }
      case "certificates": {
        const rows = certificates.filter((c) => inRange(c.issueDate));
        return {
          rows: [
            ["Certificate No.", "Student ID", "Course ID", "Status", "Issue Date"],
            ...rows.map((c) => [c.certificateNumber, c.studentId, c.courseId, c.status, formatDate(c.issueDate)]),
          ],
          count: rows.length,
        };
      }
    }
  };

  const handleGenerate = async (type: ReportType) => {
    setGenerating(type);
    try {
      const report = buildReport(type);
      if (!report) return;
      downloadCSV(`xeviqo-${type}-report-${Date.now()}.csv`, report.rows);
      await addDoc(collection(db, "reports"), {
        type,
        dateFrom: dateFrom ? Timestamp.fromDate(new Date(dateFrom)) : null,
        dateTo: dateTo ? Timestamp.fromDate(new Date(dateTo)) : null,
        recordCount: report.count,
        generatedBy: admin?.name || "Admin",
        createdAt: serverTimestamp(),
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Generate and export real data reports as CSV, filtered by date range.
        </p>
      </div>

      {/* Report Generator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6">
        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 self-end pb-2 sm:pb-2.5 sm:self-center">
            Leave blank for all-time.
          </p>
        </div>

        {/* Report Type Cards - Responsive Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {REPORT_TYPES.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/60 p-3 sm:p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center ${r.color}`}>
                  <r.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  CSV
                </span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-slate-800 dark:text-slate-100">{r.label}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Export as CSV</p>
              </div>
              <button
                onClick={() => handleGenerate(r.id)}
                disabled={generating === r.id}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 py-2 text-xs sm:text-sm font-medium text-white disabled:opacity-50 transition-colors mt-1 w-full sm:w-auto"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {generating === r.id ? "Generating..." : "Generate"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Report History */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">Recent Report Activity</h2>
        </div>
        
        {sortedHistory.length === 0 ? (
          <EmptyState title="No reports generated yet" subtitle="Generated reports will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium">Report Type</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Records</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden sm:table-cell">Generated By</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium">Generated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {sortedHistory.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 capitalize">
                        <FileBarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" /> 
                        <span className="text-xs sm:text-sm">{r.type}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                      {r.recordCount}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 hidden sm:table-cell text-xs sm:text-sm">
                      {r.generatedBy || "—"}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      {formatDate(r.createdAt, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;