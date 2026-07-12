// src/pages/user/Announcements.tsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { where } from "firebase/firestore";
import { Megaphone, Pin, Calendar, GraduationCap, Wrench, Search, SlidersHorizontal } from "lucide-react";

import { useCollection } from "../../lib/useCollection";
import { formatDate, timeAgo } from "../../lib/format";
import { EmptyState, TableSkeleton } from "../../components/ui/TableHelpers";
import type { Announcement } from "../../types";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  general: Megaphone,
  course: GraduationCap,
  event: Calendar,
  maintenance: Wrench,
};

const TABS = ["All", "Pinned", "Latest", "Events"] as const;

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${className}`}
  >
    {children}
  </div>
);

const AnnouncementsPage: React.FC = () => {
  const { data: announcements, loading } = useCollection<Announcement>("announcements", [
    where("status", "==", "published"),
  ]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => [...announcements].sort((a, b) => (b.publishedAt?.toMillis?.() ?? 0) - (a.publishedAt?.toMillis?.() ?? 0)),
    [announcements]
  );

  const filtered = useMemo(() => {
    return sorted.filter((a) => {
      const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        tab === "All" ||
        (tab === "Pinned" && a.pinned) ||
        (tab === "Latest" && !a.pinned) ||
        (tab === "Events" && a.category === "event");
      return matchesSearch && matchesTab;
    });
  }, [sorted, search, tab]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stay updated with the latest news and events.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
            />
          </div>
          <button className="rounded-xl border-2 border-slate-300 dark:border-slate-600 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] transition-all">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

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

      {loading ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <GlassCard className="border-2 border-slate-300/80 dark:border-slate-600/80">
          <EmptyState title="No announcements found" subtitle="Try a different tab or search term." />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filtered.map((a, i) => {
            const Icon = CATEGORY_ICON[a.category] || Megaphone;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-5 h-full border-2 border-slate-300/80 dark:border-slate-600/80 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border-2 border-[#6C63FF]/20">
                      <Icon className="h-5 w-5 text-[#6C63FF] dark:text-[#8B5CF6]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{a.title}</p>
                        {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{a.message}</p>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-400">{formatDate(a.publishedAt)}</span>
                        <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                        <span className="text-xs text-slate-400">{timeAgo(a.publishedAt)}</span>
                        {a.category && (
                          <>
                            <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              {a.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;