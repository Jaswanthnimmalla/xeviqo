// src/pages/user/Dashboard.tsx
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { where } from "firebase/firestore";
import {
  Users,
  Trophy,
  Sparkles,
  Flame,
  PlayCircle,
  Clock,
  Bell,
  Award,
  TrendingUp,
  Megaphone,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { useCollection, toLookupMap } from "../../lib/useCollection";
import { formatDate, timeAgo } from "../../lib/format";
import { EmptyState } from "../../components/ui/TableHelpers";
import StatusBadge from "../../components/ui/StatusBadge";
import { auth, db } from "../../firebase/firebase";

// Image from public folder
const userDashboardImage = "/images/user_dashboard.png";

// Types
interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  status: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  completionStatus: string;
  enrollmentDate: any;
}

interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  status: string;
  dueDate: any;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  marks?: number;
  submittedAt: any;
}

interface Announcement {
  id: string;
  title: string;
  status: string;
  publishedAt: any;
}

interface StudentStats {
  xp: number;
  level: number;
  streakDays: number;
}

interface Student {
  uid: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const UserDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setStudent({ uid: user.uid, ...docSnap.data() } as Student);
          }
          setLoadingStudent(false);
        });
        return () => unsubscribeDoc();
      } else {
        setUid(null);
        setStudent(null);
        setLoadingStudent(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const { data: enrollments, loading: loadingEnroll } = useCollection<Enrollment>(
    "enrollments",
    uid ? [where("studentId", "==", uid)] : []
  );
  const { data: courses } = useCollection<Course>("courses");
  const { data: certificates } = useCollection<Certificate>(
    "certificates",
    uid ? [where("studentId", "==", uid)] : []
  );
  const { data: assignments } = useCollection<Assignment>("assignments");
  const { data: submissions } = useCollection<Submission>(
    "submissions",
    uid ? [where("studentId", "==", uid)] : []
  );
  const { data: announcements } = useCollection<Announcement>("announcements", [
    where("status", "==", "published"),
  ]);

  const [stats, setStats] = useState<StudentStats>({ xp: 0, level: 1, streakDays: 0 });
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, "studentStats", uid), (snap) => {
      if (snap.exists()) setStats(snap.data() as StudentStats);
    });
    return () => unsub();
  }, [uid]);

  const courseMap = useMemo(() => toLookupMap(courses), [courses]);
  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((e) => e.courseId)), [enrollments]);
  const submissionByAssignment = useMemo(() => {
    const map: Record<string, Submission & { id: string }> = {};
    submissions.forEach((s) => {
      map[s.assignmentId] = { ...s, id: s.assignmentId };
    });
    return map;
  }, [submissions]);

  const overallProgress = useMemo(() => {
    if (enrollments.length === 0) return 0;
    return Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length);
  }, [enrollments]);

  const inProgress = useMemo(
    () => [...enrollments].filter((e) => e.completionStatus !== "completed").sort(
      (a, b) => (b.enrollmentDate?.toMillis?.() ?? 0) - (a.enrollmentDate?.toMillis?.() ?? 0)
    ),
    [enrollments]
  );
  const continueLearning = inProgress[0];

  const pendingAssignments = useMemo(() => {
    return assignments
      .filter((a) => enrolledCourseIds.has(a.courseId) && a.status === "active")
      .filter((a) => (submissionByAssignment[a.id]?.status || "pending") === "pending")
      .sort((a, b) => (a.dueDate?.toMillis?.() ?? 0) - (b.dueDate?.toMillis?.() ?? 0))
      .slice(0, 3);
  }, [assignments, enrolledCourseIds, submissionByAssignment]);

  const recentCourses = useMemo(
    () => [...enrollments].sort((a, b) => (b.enrollmentDate?.toMillis?.() ?? 0) - (a.enrollmentDate?.toMillis?.() ?? 0)).slice(0, 3),
    [enrollments]
  );

  const recommended = useMemo(
    () => courses.filter((c) => !enrolledCourseIds.has(c.id) && c.status === "active").slice(0, 3),
    [courses, enrolledCourseIds]
  );

  const recentAnnouncements = useMemo(
    () => [...announcements].sort((a, b) => (b.publishedAt?.toMillis?.() ?? 0) - (a.publishedAt?.toMillis?.() ?? 0)).slice(0, 3),
    [announcements]
  );

  const gradedSubmissions = submissions.filter((s) => s.status === "graded" && typeof s.marks === "number");
  const avgScore = gradedSubmissions.length
    ? Math.round(gradedSubmissions.reduce((s, x) => s + (x.marks || 0), 0) / gradedSubmissions.length)
    : null;

  const achievements = useMemo(() => {
    const list: { label: string; icon: React.ElementType }[] = [];
    if (certificates.length >= 1) list.push({ label: "First Certificate", icon: Award });
    if (enrollments.length >= 5) list.push({ label: "5 Courses Enrolled", icon: Sparkles });
    if (avgScore !== null && avgScore >= 90) list.push({ label: "Top Scorer", icon: Trophy });
    if (stats.streakDays >= 7) list.push({ label: "7 Day Streak", icon: Flame });
    return list;
  }, [certificates.length, enrollments.length, avgScore, stats.streakDays]);

  // Weekly activity
  const weeklyActivity = useMemo(() => {
    const days: { label: string; activity: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { weekday: "short" });
      const sameDay = (ts?: any) => {
        if (!ts) return false;
        const dt = ts.toDate ? ts.toDate() : new Date(ts);
        return dt.toDateString() === d.toDateString();
      };
      const count =
        submissions.filter((s) => sameDay(s.submittedAt)).length +
        enrollments.filter((e) => sameDay(e.enrollmentDate)).length;
      days.push({ label, activity: count });
    }
    return days;
  }, [submissions, enrollments]);

  if (loadingStudent || loadingEnroll) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="h-32 sm:h-40 md:h-48 rounded-2xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-slate-100/80 dark:bg-[#1E293B]/50 animate-pulse" />
        <div className="h-48 sm:h-56 md:h-64 rounded-2xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-slate-100/80 dark:bg-[#1E293B]/50 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-2xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-slate-100/80 dark:bg-[#1E293B]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner with image - Fully Responsive */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#4F3CC9] via-[#6C63FF] to-[#8B5CF6] p-3 sm:p-4 md:p-6 lg:p-8 text-white shadow-xl border-2 border-white/30"
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 sm:-right-10 sm:-top-10 h-32 w-32 sm:h-40 sm:w-40 md:h-56 md:w-56 rounded-full bg-white/10 blur-2xl sm:blur-3xl" />
        <div className="absolute -bottom-16 -left-16 sm:-bottom-20 sm:-left-20 h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full bg-white/5 blur-xl sm:blur-2xl" />
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Left side - Text content */}
          <div className="flex-1 w-full">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
              Welcome back, {student?.name || "Learner"}! 👋
            </h1>
            <p className="text-white/80 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">Keep learning, keep growing. You're doing great!</p>

            <div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
              {[
                { label: "Enrolled Courses", value: enrollments.length, icon: Users },
                { label: "Overall Progress", value: `${overallProgress}%`, icon: TrendingUp },
                { label: "Certificates Earned", value: certificates.length, icon: Trophy },
                { label: "XP Points", value: stats.xp.toLocaleString(), icon: Sparkles },
                { label: "Day Streak", value: stats.streakDays, icon: Flame },
              ].map((s) => (
                <div key={s.label} className="rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3">
                  <s.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mb-0.5 sm:mb-1 md:mb-2 text-white/90" />
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-none">{s.value}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] text-white/80 mt-0.5 sm:mt-0.5 md:mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex-shrink-0 hidden xs:block">
            {!imageError ? (
              <img 
                src={userDashboardImage} 
                alt="Learning illustration" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-44 xl:h-44 2xl:w-52 2xl:h-52 object-contain drop-shadow-xl"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-44 xl:h-44 2xl:w-52 2xl:h-52 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">📚</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Continue learning + next deadline + pending assignments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full">
            <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6C63FF] dark:bg-[#8B5CF6]"></span>
              Continue Learning
            </h2>
            {continueLearning ? (
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border-2 border-[#6C63FF]/30">
                  <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-7 text-[#6C63FF] dark:text-[#8B5CF6]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm md:text-base truncate">
                    {courseMap[continueLearning.courseId]?.title || "Course"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {continueLearning.progress || 0}% Completed
                  </p>
                  <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]"
                      style={{ width: `${continueLearning.progress || 0}%` }}
                    />
                  </div>
                  <button className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-90 px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium text-white transition-all shadow-md hover:shadow-lg active:scale-95">
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <PlayCircle className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No active courses</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Enroll in a course to start learning.</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full">
            <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" /> Next Deadline
            </h2>
            {pendingAssignments[0] ? (
              <div className="space-y-1">
                <p className="font-medium text-slate-800 dark:text-slate-100 text-xs sm:text-sm md:text-base">{pendingAssignments[0].title}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  {courseMap[pendingAssignments[0].courseId]?.title}
                </p>
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-medium mt-1.5 sm:mt-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Due {formatDate(pendingAssignments[0].dueDate)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Nothing due</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">You're all caught up! 🎉</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Pending Assignments
              </h2>
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            </div>
            {pendingAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Bell className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">All caught up</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No pending assignments 🎯</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {pendingAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{a.title}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Due {formatDate(a.dueDate)}</p>
                    </div>
                    <button className="shrink-0 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-90 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium text-white shadow-md hover:shadow-lg active:scale-95 transition-all">
                      Submit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Progress ring + streak + xp + achievements */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full flex flex-col items-center justify-center text-center border-2 border-[#6C63FF]/30 dark:border-[#8B5CF6]/30">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <svg viewBox="0 0 100 100" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="10"
                  strokeDasharray={`${overallProgress * 2.64} 264`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 dark:text-white text-xs sm:text-sm md:text-base">
                {overallProgress}%
              </div>
            </div>
            <p className="mt-1.5 sm:mt-2 md:mt-3 text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">Course Progress</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full border-2 border-orange-500/30 dark:border-orange-400/30">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">Learning Streak</p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{stats.streakDays} Days</p>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Keep it up! 🔥</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full border-2 border-emerald-500/30 dark:border-emerald-400/30">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">XP Progress</p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white">Level {stats.level}</p>
            <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]"
                style={{ width: `${Math.min(100, (stats.xp % 1000) / 10)}%` }}
              />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">{stats.xp.toLocaleString()} XP</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full border-2 border-amber-500/30 dark:border-amber-400/30">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2 md:mb-3">Achievements</p>
            {achievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-1.5">
                  <Award className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 text-center">Keep learning to unlock badges. 🏆</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {achievements.map((a) => (
                  <div
                    key={a.label}
                    title={a.label}
                    className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center border-2 border-[#6C63FF]/30 dark:border-[#8B5CF6]/30"
                  >
                    <a.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-[#6C63FF] dark:text-[#8B5CF6]" />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Weekly activity chart */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8}>
        <GlassCard className="p-3 sm:p-4 md:p-5 lg:p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#6C63FF]"></span>
            Weekly Activity
          </h2>
          <div className="h-32 sm:h-40 md:h-48 lg:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-slate-500 dark:text-slate-400" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} className="text-slate-500 dark:text-slate-400" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: "2px solid rgba(108, 99, 255, 0.3)", 
                    fontSize: 13,
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.1)"
                  }} 
                />
                <Area type="monotone" dataKey="activity" stroke="#6C63FF" strokeWidth={2.5} fill="url(#activityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent courses, recommended, announcements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full">
            <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Recent Courses
            </h2>
            {recentCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No courses yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Start your learning journey today! 📖</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {recentCourses.map((e) => (
                  <div key={e.id} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                      <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {courseMap[e.courseId]?.title || e.courseId}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{e.progress || 0}%</span>
                    </div>
                    <div className="mt-1 sm:mt-1.5 h-1 sm:h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]"
                        style={{ width: `${e.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={10}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full">
            <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Recommended for You
            </h2>
            {recommended.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">You're enrolled in everything!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Great job! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {recommended.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{c.title}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{c.duration}</p>
                    </div>
                    <StatusBadge label={c.category} className="text-[10px] sm:text-xs" />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={11}>
          <GlassCard className="p-3 sm:p-4 md:p-5 h-full">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Recent Announcements
              </h2>
              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            </div>
            {recentAnnouncements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Megaphone className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No announcements</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Check back later for updates 📢</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {recentAnnouncements.map((a) => (
                  <div key={a.id} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700">
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{a.title}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{timeAgo(a.publishedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;