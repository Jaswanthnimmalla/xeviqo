// src/pages/user/My Courses.tsx (Updated with Real-time Data)
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { where, collection, query, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { BookOpen, CheckCircle2, PlayCircle, Percent, Clock3, Search, SlidersHorizontal } from "lucide-react";

import { useCollection, toLookupMap } from "../../lib/useCollection";
import { EmptyState, TableSkeleton, Pagination } from "../../components/ui/TableHelpers";
import { auth, db } from "../../firebase/firebase";
import type { Course, Enrollment } from "../../types";

const PAGE_SIZE = 8;
const TABS = ["All Courses", "In Progress", "Completed"] as const;

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const MyCourses: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  
  // ✅ Real-time state for enrollments and courses
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<(typeof TABS)[number]>("All Courses");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ✅ Real-time listener for enrollments
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
    enrolled: enrollments.length,
    inProgress: enrollments.filter((e) => e.completionStatus !== "completed").length,
    completed: enrollments.filter((e) => e.completionStatus === "completed").length,
    avgProgress: enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0,
    totalHours: enrollments.reduce((sum, e) => {
      const dur = courseMap[e.courseId]?.duration || "";
      const n = parseInt(dur);
      return sum + (isNaN(n) ? 0 : n);
    }, 0),
  };

  // ✅ Filtered courses with real-time data
  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const course = courseMap[e.courseId];
      const matchesSearch = !search || course?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        tab === "All Courses" ||
        (tab === "In Progress" && e.completionStatus !== "completed") ||
        (tab === "Completed" && e.completionStatus === "completed");
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
            My Courses
          </h1>
          <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mt-0.5 xs:mt-0 truncate">
            Access and manage all your enrolled courses.
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
              placeholder="Search courses..."
              className="w-full rounded-lg xs:rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-[#1E293B]/95 py-1.5 xs:py-2 sm:py-2.5 pl-8 xs:pl-9 sm:pl-10 pr-3 xs:pr-4 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
            />
          </div>
          <button className="rounded-lg xs:rounded-xl border-2 border-slate-300 dark:border-slate-600 px-2.5 xs:px-3 py-1.5 xs:py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] transition-all">
            <SlidersHorizontal className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid with Visible Borders */}
      <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-2 xs:gap-3 sm:gap-4">
        {[
          { label: "Enrolled", value: stats.enrolled, icon: BookOpen, color: "from-violet-500/20 to-purple-500/20 text-violet-500", border: "border-violet-500/30" },
          { label: "In Progress", value: stats.inProgress, icon: PlayCircle, color: "from-blue-500/20 to-cyan-500/20 text-blue-500", border: "border-blue-500/30" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "from-green-500/20 to-emerald-500/20 text-green-500", border: "border-green-500/30" },
          { label: "Avg Progress", value: `${stats.avgProgress}%`, icon: Percent, color: "from-amber-500/20 to-yellow-500/20 text-amber-500", border: "border-amber-500/30" },
          { label: "Hours Learned", value: stats.totalHours, icon: Clock3, color: "from-pink-500/20 to-rose-500/20 text-pink-500", border: "border-pink-500/30" },
        ].map((s) => (
          <GlassCard key={s.label} className={`p-2.5 xs:p-3 sm:p-4 md:p-5 border-2 ${s.border} dark:${s.border}`}>
            <div className={`h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg xs:rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-1.5 xs:mb-2 sm:mb-3 border-2 border-white/20 dark:border-white/10`}>
              <s.icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
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

      {/* Tabs - Fully Responsive with Visible Borders */}
      <div className="flex gap-0.5 xs:gap-1 rounded-xl xs:rounded-2xl border-2 border-slate-300 dark:border-slate-600 p-1 xs:p-1.5 bg-white/95 dark:bg-[#1E293B]/95 w-fit backdrop-blur-xl overflow-x-auto max-w-full">
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

      {/* Course Grid - Fully Responsive */}
      {loadingAll ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <GlassCard className="p-8 sm:p-12 border-2 border-slate-300/80 dark:border-slate-600/80">
          <EmptyState title="No courses found" subtitle="Try a different tab or search term." />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {paged.map((e, i) => {
            const course = courseMap[e.courseId];
            const progress = e.progress || 0;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <GlassCard className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300 border-2 border-slate-300/80 dark:border-slate-600/80">
                  {/* Card Header Image */}
                  <div className="relative h-20 xs:h-24 sm:h-28 md:h-32 bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center border-b-2 border-slate-200 dark:border-slate-700">
                    <BookOpen className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-[#6C63FF] dark:text-[#8B5CF6]" />
                    <span className={`absolute top-1.5 xs:top-2 sm:top-3 right-1.5 xs:right-2 sm:right-3 rounded-full border-2 ${
                      e.completionStatus === "completed" 
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" 
                        : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                    } px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-0.5 sm:py-1 text-[7px] xs:text-[8px] sm:text-[10px] md:text-[11px] font-medium whitespace-nowrap`}>
                      {e.completionStatus === "completed" ? "✓ Completed" : "↻ In Progress"}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 xs:p-3 sm:p-4 flex flex-col flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug text-xs xs:text-sm sm:text-base line-clamp-2 min-h-[2.5rem] xs:min-h-[3rem]">
                      {course?.title || e.courseId}
                    </p>
                    
                    <div className="mt-1.5 xs:mt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400">
                          {progress}% Complete
                        </p>
                        <span className="text-[10px] xs:text-xs font-medium text-[#6C63FF] dark:text-[#8B5CF6]">
                          {progress >= 100 ? "Done!" : `${100 - progress}% left`}
                        </span>
                      </div>
                      <div className="mt-1 h-1 xs:h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] transition-all duration-500"
                          style={{ width: `${Math.min(100, e.progress || 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 xs:gap-3 text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 mt-2 xs:mt-3 pt-2 xs:pt-2.5 border-t-2 border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course?.totalAssignments || 0}
                      </span>
                      <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {course?.duration || "N/A"}
                      </span>
                    </div>

                    <button className="mt-2.5 xs:mt-3 sm:mt-4 w-full rounded-lg xs:rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-90 active:scale-95 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm font-medium text-white transition-all duration-200 shadow-md hover:shadow-lg border-2 border-white/20">
                      {e.completionStatus === "completed" ? "📖 Review Course" : "▶ Continue Learning"}
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination - Fully Responsive */}
      {!loadingAll && filtered.length > 0 && (
        <GlassCard className="p-3 xs:p-4 sm:p-5 border-2 border-slate-300/80 dark:border-slate-600/80">
          <Pagination 
            page={page} 
            totalItems={filtered.length} 
            pageSize={PAGE_SIZE} 
            onPageChange={setPage} 
          />
        </GlassCard>
      )}
    </div>
  );
};

export default MyCourses;