// src/pages/user/Final Year Projects.tsx
// "Buy" writes a real record to a new `purchases` collection
// (studentId, projectId, amount, status, createdAt) since the existing
// `payments` schema is keyed to courseId, not projectId.
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FolderKanban, Search, SlidersHorizontal, Star, Download, Heart, Check, Filter } from "lucide-react";

import { db } from "../../firebase/firebase";
import { useCollection } from "../../lib/useCollection";
import { useCurrentStudent } from "../../lib/useCurrentStudent";
import { formatCurrency } from "../../lib/format";
import { EmptyState, TableSkeleton, Pagination } from "../../components/ui/TableHelpers";
import type { Project } from "../../types";

const PAGE_SIZE = 8;

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const FinalYearProjects: React.FC = () => {
  const { uid } = useCurrentStudent();
  const { data: projects, loading } = useCollection<Project>("projects");

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("All Categories");
  const [page, setPage] = useState(1);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const domains = useMemo(() => ["All Categories", ...Array.from(new Set(projects.map((p) => p.domain).filter(Boolean) as string[]))], [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.technology?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesDomain = domainFilter === "All Categories" || p.domain === domainFilter;
      return matchesSearch && matchesDomain;
    });
  }, [projects, search, domainFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgRating = projects.length
    ? (projects.reduce((s, p) => s + (p as any).rating || 0, 0) / projects.length).toFixed(1)
    : "—";
  const cheapest = projects.length ? Math.min(...projects.map((p) => p.price)) : 0;

  const handleBuy = async (project: Project) => {
    if (!uid) return;
    setPurchasing(project.id);
    try {
      await addDoc(collection(db, "purchases"), {
        studentId: uid,
        projectId: project.id,
        projectTitle: project.title,
        amount: project.price,
        status: "completed",
        createdAt: serverTimestamp(),
      });
      setPurchased((prev) => new Set(prev).add(project.id));
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl mx-auto">
      {/* Header Section - Fully Responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
            Final Year Projects
          </h1>
          <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mt-0.5 xs:mt-0 truncate">
            Explore innovative projects across domains and technologies.
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
              placeholder="Search projects..."
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
          { label: "Total Projects", value: projects.length, icon: FolderKanban, border: "border-violet-500/30" },
          { label: "Avg Rating", value: avgRating, icon: Star, border: "border-amber-500/30" },
          { label: "Starting Price", value: formatCurrency(cheapest), icon: Download, border: "border-green-500/30" },
          { label: "Domains", value: domains.length - 1, icon: FolderKanban, border: "border-blue-500/30" },
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

      {/* Category Filters - Fully Responsive with Better Borders */}
      <div className="flex gap-1.5 xs:gap-2 overflow-x-auto pb-1.5 xs:pb-2 scrollbar-thin">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => {
              setDomainFilter(d);
              setPage(1);
            }}
            className={`shrink-0 rounded-lg xs:rounded-xl px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              domainFilter === d
                ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md border-2 border-white/20"
                : "border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Projects Grid - Fully Responsive */}
      {loading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : filtered.length === 0 ? (
        <GlassCard className="p-8 sm:p-12 border-2 border-slate-300/80 dark:border-slate-600/80">
          <EmptyState title="No projects found" subtitle="Try a different category or search term." />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {paged.map((p, i) => {
            const bought = purchased.has(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="h-full"
              >
                <GlassCard className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300 border-2 border-slate-300/80 dark:border-slate-600/80">
                  {/* Card Header */}
                  <div className="relative h-24 xs:h-28 sm:h-32 bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center border-b-2 border-slate-200 dark:border-slate-700">
                    <FolderKanban className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 text-[#6C63FF] dark:text-[#8B5CF6]" />
                    <button 
                      className="absolute top-2 xs:top-2.5 sm:top-3 right-2 xs:right-2.5 sm:right-3 h-7 w-7 xs:h-8 xs:w-8 rounded-full bg-white/90 dark:bg-slate-900/80 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors border-2 border-slate-200 dark:border-slate-700"
                      aria-label="Favorite project"
                    >
                      <Heart className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-slate-500 dark:text-slate-300" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 xs:p-3 sm:p-4 flex flex-col flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug text-xs xs:text-sm sm:text-base line-clamp-2 min-h-[2.5rem] xs:min-h-[3rem]">
                      {p.title}
                    </p>
                    
                    <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[2.5rem] xs:min-h-[3rem]">
                      {p.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 xs:gap-1.5 mt-2 xs:mt-2.5">
                      {(p.technology || []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 dark:bg-white/10 px-1.5 xs:px-2 py-0.5 text-[8px] xs:text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[60px] xs:max-w-[80px] border border-slate-200 dark:border-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                      {(p.technology || []).length > 3 && (
                        <span className="text-[8px] xs:text-[10px] text-slate-400">
                          +{(p.technology || []).length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 xs:mt-4 pt-2 xs:pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400">Price</span>
                        <p className="font-bold text-slate-900 dark:text-white text-xs xs:text-sm sm:text-base">
                          {formatCurrency(p.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuy(p)}
                        disabled={bought || purchasing === p.id}
                        className={`rounded-lg xs:rounded-xl px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 xs:gap-1.5 ${
                          bought
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default border-2 border-green-500/30"
                            : "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg border-2 border-white/20"
                        }`}
                      >
                        {bought ? (
                          <>
                            <Check className="h-3 w-3 xs:h-3.5 xs:w-3.5" />
                            <span className="hidden xs:inline">Purchased</span>
                            <span className="xs:hidden">Owned</span>
                          </>
                        ) : purchasing === p.id ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 xs:h-3.5 xs:w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            <span className="hidden xs:inline">Processing</span>
                          </span>
                        ) : (
                          "Buy Now"
                        )}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
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

export default FinalYearProjects;