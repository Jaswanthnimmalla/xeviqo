// src/pages/Analytics.tsx
import React, { useMemo, useState } from "react";
import { TrendingUp, Users, Wallet, GraduationCap } from "lucide-react";

import { useCollection } from "../lib/useCollection";
import { formatCurrency } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import type { AppUser, Course, Enrollment, Payment } from "../types";

const RANGE_OPTIONS = [7, 30, 90] as const;
const PIE_COLORS = ["#6C63FF", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6"];

const Analytics: React.FC = () => {
  const { data: students, loading: l1 } = useCollection<AppUser>("users");
  const { data: courses, loading: l2 } = useCollection<Course>("courses");
  const { data: enrollments, loading: l3 } = useCollection<Enrollment>("enrollments");
  const { data: payments, loading: l4 } = useCollection<Payment>("payments");

  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const loading = l1 || l2 || l3 || l4;

  const studentUsers = useMemo(() => students.filter((s) => s.role === "student"), [students]);

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.paymentStatus === "paid").reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );

  const completionRate = useMemo(() => {
    if (enrollments.length === 0) return 0;
    const completed = enrollments.filter((e) => e.completionStatus === "completed").length;
    return Math.round((completed / enrollments.length) * 100);
  }, [enrollments]);

  // Revenue + enrollment trend over the selected range
  const trend = useMemo(() => {
    const days: { label: string; revenue: number; enrollments: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const sameDay = (ts?: any) => {
        if (!ts) return false;
        const dt = ts.toDate();
        return dt.getDate() === d.getDate() && dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
      };
      const revenue = payments
        .filter((p) => p.paymentStatus === "paid" && sameDay(p.paymentDate))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const enrollCount = enrollments.filter((e) => sameDay(e.enrollmentDate)).length;
      days.push({ label, revenue, enrollments: enrollCount });
    }
    return days;
  }, [payments, enrollments, range]);

  // Course performance
  const coursePerformance = useMemo(
    () =>
      [...courses]
        .sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0))
        .slice(0, 6),
    [courses]
  );

  const maxStudents = useMemo(
    () => Math.max(...coursePerformance.map((c) => c.totalStudents || 0), 1),
    [coursePerformance]
  );

  // Payment method distribution
  const methodBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    payments.forEach((p) => {
      const key = p.paymentMethod || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const maxMethodValue = useMemo(
    () => Math.max(...methodBreakdown.map((m) => m.value), 1),
    [methodBreakdown]
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Cross-platform insights, live from your data.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-slate-200 dark:border-slate-700 p-1 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                range === r
                  ? "bg-[#6C63FF] text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Total Students" value={studentUsers.length} icon={Users} color="violet" loading={loading} />
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={Wallet} color="amber" loading={loading} />
        <StatCard
          label="Avg. Enrollment/Course"
          value={courses.length ? Math.round(enrollments.length / courses.length) : 0}
          icon={GraduationCap}
          color="blue"
          loading={loading}
        />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="green" loading={loading} />
      </div>

      {/* Trend Chart - CSS based */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6">
        <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-3 sm:mb-4">
          Revenue &amp; Enrollments — Last {range} Days
        </h2>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px] sm:min-w-full">
            <div className="flex items-end gap-1 sm:gap-2 h-48 sm:h-56 md:h-64">
              {trend.map((day, idx) => {
                const maxRevenue = Math.max(...trend.map(d => d.revenue), 1);
                const maxEnrollments = Math.max(...trend.map(d => d.enrollments), 1);
                const revenueHeight = (day.revenue / maxRevenue) * 80;
                const enrollHeight = (day.enrollments / maxEnrollments) * 80;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 w-full h-40 sm:h-48 md:h-56">
                      <div className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-[#6C63FF] rounded-t transition-all duration-300"
                          style={{ height: `${revenueHeight}%`, minHeight: '2px' }}
                        />
                        <span className="text-[8px] sm:text-[10px] text-slate-400 mt-1">₹</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-emerald-500 rounded-t transition-all duration-300"
                          style={{ height: `${enrollHeight}%`, minHeight: '2px' }}
                        />
                        <span className="text-[8px] sm:text-[10px] text-slate-400 mt-1">📚</span>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[10px] text-slate-400 truncate w-full text-center">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-[10px] sm:text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#6C63FF]"></span> Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Enrollments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Courses */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6">
          <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-3 sm:mb-4">Top Courses by Students</h2>
          {coursePerformance.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No course data yet.</p>
          ) : (
            <div className="space-y-3">
              {coursePerformance.map((course, idx) => {
                const percentage = ((course.totalStudents || 0) / maxStudents) * 100;
                return (
                  <div key={course.id} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 w-5 text-right">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                          {course.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">
                          {course.totalStudents || 0}
                        </span>
                      </div>
                      <div className="h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6">
          <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-3 sm:mb-4">Payment Methods</h2>
          {methodBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No payment data yet.</p>
          ) : (
            <div className="space-y-3">
              {methodBreakdown.map((method, idx) => {
                const percentage = (method.value / maxMethodValue) * 100;
                const color = PIE_COLORS[idx % PIE_COLORS.length];
                return (
                  <div key={method.name} className="flex items-center gap-2 sm:gap-3">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-700 dark:text-slate-300 capitalize">
                          {method.name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">
                          {method.value}
                        </span>
                      </div>
                      <div className="h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 w-12 text-right">
                      {Math.round((method.value / methodBreakdown.reduce((sum, m) => sum + m.value, 0)) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;