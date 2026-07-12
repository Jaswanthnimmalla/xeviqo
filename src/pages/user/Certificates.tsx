// src/pages/user/Certificates.tsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { where } from "firebase/firestore";
import { Award, CheckCircle2, Clock, Trophy, Search, Download, Share2, ShieldCheck, X, SlidersHorizontal } from "lucide-react";

import { useCollection, toLookupMap } from "../../lib/useCollection";
import { useCurrentStudent } from "../../lib/useCurrentStudent";
import { formatDate } from "../../lib/format";
import StatusBadge from "../../components/ui/StatusBadge";
import { EmptyState, TableSkeleton } from "../../components/ui/TableHelpers";
import type { Certificate, Course } from "../../types";

const TABS = ["All Certificates", "Completed", "In Progress"] as const;

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${className}`}
  >
    {children}
  </div>
);

const CertificatesPage: React.FC = () => {
  const { uid, loading: loadingStudent } = useCurrentStudent();
  const { data: certificates, loading } = useCollection<Certificate>(
    "certificates",
    uid ? [where("studentId", "==", uid)] : []
  );
  const { data: courses } = useCollection<Course>("courses");

  const [tab, setTab] = useState<(typeof TABS)[number]>("All Certificates");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Certificate | null>(null);

  const courseMap = useMemo(() => toLookupMap(courses), [courses]);

  const stats = {
    total: certificates.length,
    completed: certificates.filter((c) => c.status === "issued").length,
    inProgress: certificates.filter((c) => c.status === "pending").length,
  };

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      const course = courseMap[c.courseId];
      const matchesSearch = !search || course?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        tab === "All Certificates" ||
        (tab === "Completed" && c.status === "issued") ||
        (tab === "In Progress" && c.status === "pending");
      return matchesSearch && matchesTab;
    });
  }, [certificates, courseMap, search, tab]);

  const handleShare = async (c: Certificate) => {
    const text = `I just earned a certificate in ${courseMap[c.courseId]?.title || "a course"} on Xeviqo! Certificate No. ${c.certificateNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const loadingAll = loading || loadingStudent;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header - Added border to input */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Certificates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all your earned certificates in one place.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificates..."
            className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
          />
        </div>
      </div>

      {/* Stats Cards - Added colored borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total Certificates", value: stats.total, icon: Award, border: "border-violet-500/30" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, border: "border-green-500/30" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, border: "border-amber-500/30" },
        ].map((s) => (
          <GlassCard key={s.label} className={`p-4 border-2 ${s.border} dark:${s.border}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center mb-3">
              <s.icon className="h-5 w-5 text-[#6C63FF] dark:text-[#8B5CF6]" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Tabs - Added border-2 */}
      <div className="flex gap-1 rounded-2xl border-2 border-slate-300 dark:border-slate-600 p-1.5 bg-white/70 dark:bg-white/5 w-fit backdrop-blur-xl">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Certificate Grid */}
      {loadingAll ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <GlassCard className="border-2 border-slate-300/80 dark:border-slate-600/80">
          <EmptyState title="No certificates yet" subtitle="Complete a course to earn your first certificate." />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((c, i) => {
            const course = courseMap[c.courseId];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
                <GlassCard className="overflow-hidden border-2 border-slate-300/80 dark:border-slate-600/80">
                  <div
                    onClick={() => c.status === "issued" && setPreview(c)}
                    className="relative h-40 bg-gradient-to-br from-[#6C63FF]/10 to-[#8B5CF6]/10 flex flex-col items-center justify-center cursor-pointer border-b-2 border-slate-200 dark:border-slate-700"
                  >
                    <Trophy className="h-9 w-9 text-[#6C63FF] dark:text-[#8B5CF6]" />
                    <p className="mt-2 text-xs font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                      Certificate {c.status === "issued" ? "of Completion" : "In Progress"}
                    </p>
                    {/* Status badge on card */}
                    <div className="absolute top-3 right-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium border-2 ${
                        c.status === "issued" 
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" 
                          : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                      }`}>
                        {c.status === "issued" ? "✓ Issued" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course?.title || c.courseId}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {c.status === "issued" ? `Issued on ${formatDate(c.issueDate)}` : "Awaiting completion"}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                      <StatusBadge label={c.status === "issued" ? "Completed" : "In Progress"} />
                      {c.status === "issued" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleShare(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/30 transition-all">
                            <Share2 className="h-4 w-4" />
                          </button>
                          {c.certificateUrl && (
                            <a href={c.certificateUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/30 transition-all">
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Note - Added border */}
      <div className="flex items-center gap-2 text-xs text-slate-400 justify-center border-2 border-slate-300/50 dark:border-slate-600/50 rounded-xl p-3 bg-white/50 dark:bg-white/5">
        <ShieldCheck className="h-3.5 w-3.5" /> Certificates are issued after successful completion of the course and assessments.
      </div>

      {/* Preview Modal - Added border */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-xl border-2 border-slate-300/80 dark:border-slate-600/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Certificate Preview</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded-lg p-1 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-[#6C63FF]/30 bg-gradient-to-br from-[#6C63FF]/5 to-[#8B5CF6]/5 p-8 text-center">
              <Trophy className="h-10 w-10 text-[#6C63FF] mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Certificate of Completion</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">This certifies successful completion of</p>
              <p className="mt-1 font-semibold text-[#6C63FF]">{courseMap[preview.courseId]?.title}</p>
              <p className="mt-4 text-xs text-slate-400">
                Certificate No. {preview.certificateNumber} • {formatDate(preview.issueDate)}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                {preview.certificateUrl && (
                  <a
                    href={preview.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity border-2 border-white/20"
                  >
                    <Download className="h-4 w-4 inline mr-1" /> Download
                  </a>
                )}
                <button
                  onClick={() => handleShare(preview)}
                  className="rounded-lg border-2 border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Share2 className="h-4 w-4 inline mr-1" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;