
// src/pages/Courses.tsx
import React, { useMemo, useState } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { BookOpen, PlayCircle, Users as UsersIcon, Wallet, Search, Plus, Pencil, Trash2, Eye, X } from "lucide-react";

import { db } from "../firebase/firebase"; // ✅ Fixed import path
import { useCollection } from "../lib/useCollection";
import { formatCurrency, formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton, Pagination } from "../components/ui/TableHelpers";
import type { Course, Payment } from "../types";

const PAGE_SIZE = 6;
const emptyCourse: Partial<Course> = {
  title: "",
  category: "",
  technology: "",
  trainerName: "",
  duration: "",
  level: "Beginner",
  mode: "Online",
  price: 0,
  discountPrice: 0,
  status: "draft",
  featured: false,
  certificate: true,
  description: "",
};

const Courses: React.FC = () => {
  const { data: courses, loading } = useCollection<Course>("courses");
  const { data: payments } = useCollection<Payment>("payments");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalCourse, setModalCourse] = useState<Course | "new" | null>(null);

  const categories = useMemo(() => Array.from(new Set(courses.map((c) => c.category).filter(Boolean))), [courses]);

  const totalRevenue = useMemo(
    () =>
      payments.filter((p) => p.paymentStatus === "paid").reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.trainerName?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, search, categoryFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course permanently?")) return;
    await deleteDoc(doc(db, "courses", id));
  };

  const togglePublish = async (c: Course) => {
    await updateDoc(doc(db, "courses", c.id), {
      status: c.status === "active" ? "draft" : "active",
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage all training courses and programs.</p>
        </div>
        <button
          onClick={() => setModalCourse("new")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add New Course
        </button>
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Total Courses" value={courses.length} icon={BookOpen} color="violet" loading={loading} />
        <StatCard
          label="Published"
          value={courses.filter((c) => c.status === "active").length}
          icon={PlayCircle}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Total Students"
          value={courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0)}
          icon={UsersIcon}
          color="green"
          loading={loading}
        />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={Wallet} color="amber" />
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] overflow-hidden">
        {/* Filters - Responsive */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-700/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search courses..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 w-full xs:w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 w-full xs:w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Published</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table - Fully Responsive */}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No courses found" subtitle="Try adjusting your search or add a new course." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium">Course</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden lg:table-cell">Instructor</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden xl:table-cell">Category</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-center">Students</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden md:table-cell">Price</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {paged.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Course Name */}
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">
                          {c.title?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm">
                            {c.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                            {c.duration}
                          </p>
                          {/* Show instructor on mobile */}
                          <p className="lg:hidden text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {c.trainerName || "—"}
                          </p>
                          {/* Show category on mobile */}
                          <span className="lg:hidden inline-block mt-1">
                            <StatusBadge label={c.category} />
                          </span>
                        </div>
                        {c.featured && (
                          <span className="hidden sm:inline">
                            <StatusBadge label="Featured" />
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Instructor - Hidden on mobile/tablet */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell text-xs">
                      {c.trainerName || "—"}
                    </td>
                    
                    {/* Category - Hidden on mobile/tablet/desktop small */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden xl:table-cell">
                      <StatusBadge label={c.category} />
                    </td>
                    
                    {/* Students - Center aligned */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 text-center text-xs sm:text-sm">
                      {c.totalStudents || 0}
                    </td>
                    
                    {/* Price - Hidden on mobile */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                      <span className="font-medium text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                        {formatCurrency(c.discountPrice || c.price)}
                      </span>
                      {c.discountPrice ? (
                        <span className="ml-1 text-[10px] sm:text-xs text-slate-400 line-through">
                          {formatCurrency(c.price)}
                        </span>
                      ) : null}
                    </td>
                    
                    {/* Status - Hidden on mobile */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <button onClick={() => togglePublish(c)}>
                        <StatusBadge label={c.status === "active" ? "Published" : c.status} />
                      </button>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        <button 
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => setModalCourse(c)}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </div>

      {/* Modal */}
      {modalCourse && (
        <CourseModal course={modalCourse === "new" ? null : modalCourse} onClose={() => setModalCourse(null)} />
      )}
    </div>
  );
};

const CourseModal: React.FC<{ course: Course | null; onClose: () => void }> = ({ course, onClose }) => {
  const [form, setForm] = useState<Partial<Course>>(course || emptyCourse);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Course, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (course) {
        await updateDoc(doc(db, "courses", course.id), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "courses"), {
          ...form,
          totalStudents: 0,
          totalAssignments: 0,
          totalProjects: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
            {course ? "Edit Course" : "Add New Course"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Course title"
            className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Category"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={form.trainerName}
            onChange={(e) => set("trainerName", e.target.value)}
            placeholder="Trainer name"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="Duration (e.g. 4 Months)"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={form.technology}
            onChange={(e) => set("technology", e.target.value)}
            placeholder="Technology"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
            placeholder="Price"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            type="number"
            value={form.discountPrice}
            onChange={(e) => set("discountPrice", Number(e.target.value))}
            placeholder="Discount price"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="draft">Draft</option>
            <option value="active">Published</option>
            <option value="inactive">Inactive</option>
          </select>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Description"
            rows={3}
            className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!form.certificate}
                onChange={(e) => set("certificate", e.target.checked)}
              />
              Offers certificate
            </label>
          </div>
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
            disabled={saving || !form.title}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 order-1 sm:order-2"
          >
            {saving ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;
