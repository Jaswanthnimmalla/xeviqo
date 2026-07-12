// src/pages/user/Profile.tsx
import React, { useMemo } from "react";
import { where } from "firebase/firestore";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Sparkles,
  Flame,
  Pencil,
} from "lucide-react";

import { useCollection, toLookupMap } from "../../lib/useCollection";
import { useCurrentStudent } from "../../lib/useCurrentStudent";
import { formatDate, timeAgo } from "../../lib/format";
import { EmptyState } from "../../components/ui/TableHelpers";
import type { Course, Enrollment, Certificate, Submission, Payment } from "../../types";

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${className}`}
  >
    {children}
  </div>
);

const ProfilePage: React.FC = () => {
  const { student, uid, loading } = useCurrentStudent();
  const { data: enrollments } = useCollection<Enrollment>("enrollments", uid ? [where("studentId", "==", uid)] : []);
  const { data: courses } = useCollection<Course>("courses");
  const { data: certificates } = useCollection<Certificate>("certificates", uid ? [where("studentId", "==", uid)] : []);
  const { data: submissions } = useCollection<Submission>("submissions", uid ? [where("studentId", "==", uid)] : []);
  const { data: payments } = useCollection<Payment>("payments", uid ? [where("studentId", "==", uid)] : []);

  const courseMap = useMemo(() => toLookupMap(courses), [courses]);

  const gradedWithMarks = submissions.filter((s) => typeof s.marks === "number");
  const avgRating = gradedWithMarks.length
    ? (gradedWithMarks.reduce((s, x) => s + (x.marks || 0), 0) / gradedWithMarks.length / 20).toFixed(1)
    : "—";

  const activity = useMemo(() => {
    type Item = { label: string; sub: string; ts?: any; icon: React.ElementType };
    const items: Item[] = [];
    submissions
      .filter((s) => s.status === "submitted" || s.status === "graded")
      .forEach((s) =>
        items.push({
          label: `Submitted an assignment`,
          sub: courseMap[s.courseId]?.title || "",
          ts: s.submittedAt,
          icon: CheckCircle2,
        })
      );
    certificates.forEach((c) =>
      items.push({
        label: `Earned certificate`,
        sub: courseMap[c.courseId]?.title || "",
        ts: c.issueDate,
        icon: Award,
      })
    );
    payments
      .filter((p) => p.paymentStatus === "paid")
      .forEach((p) =>
        items.push({
          label: `Payment completed`,
          sub: courseMap[p.courseId]?.title || "",
          ts: p.paymentDate,
          icon: Sparkles,
        })
      );
    enrollments.forEach((e) =>
      items.push({
        label: `Enrolled in a course`,
        sub: courseMap[e.courseId]?.title || "",
        ts: e.enrollmentDate,
        icon: BookOpen,
      })
    );
    return items.sort((a, b) => (b.ts?.toMillis?.() ?? 0) - (a.ts?.toMillis?.() ?? 0)).slice(0, 6);
  }, [submissions, certificates, payments, enrollments, courseMap]);

  const achievements = useMemo(() => {
    const list: { label: string; sub: string; icon: React.ElementType }[] = [];
    if (gradedWithMarks.some((s) => (s.marks || 0) >= 90))
      list.push({ label: "Top Performer", sub: "Scored above 90% in an assignment", icon: Trophy });
    if (submissions.filter((s) => s.status !== "pending").length >= 5)
      list.push({ label: "Consistent Learner", sub: "Submitted 5+ assignments", icon: Flame });
    if (certificates.length >= 1)
      list.push({ label: "Quick Starter", sub: "Earned your first certificate", icon: Sparkles });
    return list;
  }, [gradedWithMarks, submissions, certificates]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-40 rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-slate-100/80 dark:bg-white/5 animate-pulse mb-6" />
        <div className="h-64 rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-slate-100/80 dark:bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Card */}
      <GlassCard className="p-5 sm:p-8 border-2 border-slate-300/80 dark:border-slate-600/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center text-2xl font-bold text-[#6C63FF] dark:text-[#8B5CF6] overflow-hidden shrink-0 border-2 border-[#6C63FF]/30">
            {student?.profileImage ? (
              <img src={student.profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              student?.name?.charAt(0).toUpperCase() || "S"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{student?.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{student?.email}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {student?.email}
              </span>
              {student?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {student.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Member since {formatDate(student?.createdAt as any)}
              </span>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] shrink-0 transition-all">
            <Pencil className="h-4 w-4" /> Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {[
            { label: "Courses Enrolled", value: enrollments.length, icon: BookOpen },
            { label: "Certificates Earned", value: certificates.length, icon: Award },
            { label: "Assignments Submitted", value: submissions.filter((s) => s.status !== "pending").length, icon: CheckCircle2 },
            { label: "Avg. Score", value: gradedWithMarks.length ? `${Math.round(gradedWithMarks.reduce((s, x) => s + (x.marks || 0), 0) / gradedWithMarks.length)}%` : "—", icon: Star },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 text-center border-2 border-slate-200 dark:border-slate-700">
              <s.icon className="h-4 w-4 mx-auto text-[#6C63FF] dark:text-[#8B5CF6] mb-1.5" />
              <p className="font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Learning Progress */}
        <GlassCard className="lg:col-span-2 p-5 sm:p-6 border-2 border-slate-300/80 dark:border-slate-600/80">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Learning Progress</h2>
          {enrollments.length === 0 ? (
            <EmptyState title="No courses yet" />
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 5).map((e) => (
                <div key={e.id} className="border-b-2 border-slate-100 dark:border-slate-700 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {courseMap[e.courseId]?.title || e.courseId}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{e.progress || 0}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
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

        {/* Account Information */}
        <GlassCard className="p-5 sm:p-6 border-2 border-slate-300/80 dark:border-slate-600/80">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-[#6C63FF]" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Account Information</h2>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Full Name" value={student?.name || "—"} />
            <Row label="Email" value={student?.email || "—"} />
            <Row label="Phone" value={student?.phone || "—"} />
            <Row label="Status" value={student?.status || "—"} />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <GlassCard className="p-5 sm:p-6 border-2 border-slate-300/80 dark:border-slate-600/80">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 border-b-2 border-slate-100 dark:border-slate-700 pb-3 last:border-b-0 last:pb-0">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border-2 border-[#6C63FF]/20">
                    <a.icon className="h-4 w-4 text-[#6C63FF] dark:text-[#8B5CF6]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.sub}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(a.ts)}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Achievements */}
        <GlassCard className="p-5 sm:p-6 border-2 border-slate-300/80 dark:border-slate-600/80">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Achievements</h2>
          {achievements.length === 0 ? (
            <EmptyState title="No achievements yet" subtitle="Keep learning to unlock badges." />
          ) : (
            <div className="space-y-4">
              {achievements.map((a, i) => (
                <div key={i} className="flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-700 pb-3 last:border-b-0 last:pb-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center shrink-0 border-2 border-amber-500/30">
                    <a.icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between border-b-2 border-slate-100 dark:border-slate-700/40 pb-2">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[60%] text-right">{value}</span>
  </div>
);

export default ProfilePage;