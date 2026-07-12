// src/pages/user/Enrollments.tsx (Updated with Real-time Data)
import React, { useMemo, useState, useEffect } from "react";
import { where, collection, query, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { BookOpen, PlayCircle, CheckCircle2, Clock3, Star, Search, SlidersHorizontal } from "lucide-react";

import { toLookupMap } from "../../lib/useCollection";
import { formatDate } from "../../lib/format";
import StatusBadge from "../../components/ui/StatusBadge";
import { EmptyState, TableSkeleton, Pagination } from "../../components/ui/TableHelpers";
import { auth, db } from "../../firebase/firebase";
import type { Course, Enrollment } from "../../types";

const PAGE_SIZE = 8;
const TABS = ["All Enrollments", "In Progress", "Completed", "On Hold"] as const;

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const Enrollments: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  
  // ✅ Real-time state for enrollments and courses
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<(typeof TABS)[number]>("All Enrollments");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ✅ Real-time listener for auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
      setLoadingStudent(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Real-time listener for enrollments
  useEffect(() => {
    if (!uid) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const enrollmentsRef = collection(db, "enrollments");
    const q = query(enrollmentsRef, where("studentId", "==", uid));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const enrollmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Enrollment[];
        setEnrollments(enrollmentsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching enrollments:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // ✅ Real-time listener for courses
  useEffect(() => {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        setCourses(coursesData);
      },
      (error) => {
        console.error("Error fetching courses:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const courseMap = useMemo(() => toLookupMap(courses), [courses]);

  // ✅ Stats with real-time data
  const stats = {
    total: enrollments.length,
    inProgress: enrollments.filter((e) => e.status === "active" && e.completionStatus !== "completed").length,
    completed: enrollments.filter((e) => e.completionStatus === "completed").length,
    avgProgress: enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0,
  };

  // ✅ Filtered enrollments with real-time data
  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const course = courseMap[e.courseId];
      const matchesSearch = !search || course?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        tab === "All Enrollments" ||
        (tab === "In Progress" && e.status === "active" && e.completionStatus !== "completed") ||
        (tab === "Completed" && e.completionStatus === "completed") ||
        (tab === "On Hold" && e.status === "pending");
      return matchesSearch && matchesTab;
    });
  }, [enrollments, courseMap, search, tab]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const loadingAll = loading || loadingStudent;

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl mx-auto">
      {/* Header Section - Fully Responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
            My Enrollments
          </h1>
          <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mt-0.5 xs:mt-0 truncate">
            All the courses you are currently enrolled in.
          </p>
        </div>
        <div className="flex gap-1.5 xs:gap-2 w-full xs:w-auto">
          <div className="relative flex-1 xs:min-w-[140px] sm:min-w-[180px] md:min-w-[200px] lg:w-64">
            <Search className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search enrollments..."
              className="w-full rounded-lg xs:rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-[#1E293B]/95 py-1.5 xs:py-2 sm:py-2.5 pl-8 xs:pl-9 sm:pl-10 pr-3 xs:pr-4 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
            />
          </div>
          <button className="rounded-lg xs:rounded-xl border-2 border-slate-300 dark:border-slate-600 px-2.5 xs:px-3 py-1.5 xs:py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] transition-all">
            <SlidersHorizontal className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid with Colored Borders */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        {[
          { label: "Total Enrollments", value: stats.total, icon: BookOpen, border: "border-violet-500/30" },
          { label: "In Progress", value: stats.inProgress, icon: PlayCircle, border: "border-blue-500/30" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, border: "border-green-500/30" },
          { label: "Avg Progress", value: `${stats.avgProgress}%`, icon: Star, border: "border-amber-500/30" },
        ].map((s) => (
          <GlassCard key={s.label} className={`p-2.5 xs:p-3 sm:p-4 md:p-5 border-2 ${s.border} dark:${s.border}`}>
            <div className={`h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg xs:rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center mb-1.5 xs:mb-2 sm:mb-3 border-2 border-white/20 dark:border-white/10`}>
              <s.icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-[#6C63FF] dark:text-[#8B5CF6]" />
            </div>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              {s.label}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Main Table Card */}
      <GlassCard className="overflow-hidden border-2 border-slate-300/80 dark:border-slate-600/80">
        {/* Tabs - Fully Responsive */}
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
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table Content */}
        {loadingAll ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12">
            <EmptyState title="No enrollments found" subtitle="Try a different tab or search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs xs:text-sm">
              <thead>
                <tr className="text-left text-[10px] xs:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 font-medium">Course</th>
                  <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-medium">Progress</th>
                  <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-medium hidden xs:table-cell">Status</th>
                  <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 font-medium hidden md:table-cell">Enrolled On</th>
                  <th className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700">
                {paged.map((e) => {
                  const course = courseMap[e.courseId];
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      {/* Course Column */}
                      <td className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3">
                        <div className="flex items-center gap-2 xs:gap-3">
                          <div className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-lg xs:rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border-2 border-[#6C63FF]/20 dark:border-[#8B5CF6]/20">
                            <BookOpen className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4.5 sm:w-4.5 text-[#6C63FF] dark:text-[#8B5CF6]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-xs xs:text-sm">
                              {course?.title || e.courseId}
                            </p>
                            <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400">
                              {course?.totalAssignments || 0} Lessons
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Progress Column */}
                      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3">
                        <div className="flex items-center gap-1.5 xs:gap-2 min-w-[60px] xs:min-w-[80px] sm:min-w-[100px] md:w-32">
                          <div className="h-1 xs:h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] transition-all duration-500"
                              style={{ width: `${Math.min(100, e.progress || 0)}%` }}
                            />
                          </div>
                          <span className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {e.progress || 0}%
                          </span>
                        </div>
                      </td>

                      {/* Status Column - Hidden on smallest screens */}
                      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 hidden xs:table-cell">
                        <StatusBadge 
                          label={e.completionStatus === "completed" ? "Completed" : "In Progress"} 
                          className="text-[10px] xs:text-xs"
                        />
                      </td>

                      {/* Enrolled On - Hidden on medium screens and below */}
                      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell text-xs">
                        {formatDate(e.enrollmentDate)}
                      </td>

                      {/* Action Column */}
                      <td className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 text-right">
                        <button className="rounded-lg xs:rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-90 active:scale-95 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-medium text-white transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap border-2 border-white/20">
                          {e.completionStatus === "completed" ? "📖 Review" : "▶ Continue"}
                        </button>
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
          <div className="p-2 xs:p-3 sm:p-4 border-t-2 border-slate-200 dark:border-slate-700">
            <Pagination 
              page={page} 
              totalItems={filtered.length} 
              pageSize={PAGE_SIZE} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Enrollments;