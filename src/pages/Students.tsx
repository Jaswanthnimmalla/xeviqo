// src/pages/Students.tsx
import React, { useMemo, useState, useEffect } from "react";
import { where, doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp, onSnapshot, query } from "firebase/firestore";
import { Users, UserCheck, UserPlus, UserX, Search, Download, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

import { db } from "../firebase/firebase";
import { formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton, Pagination } from "../components/ui/TableHelpers";
import type { AppUser, Enrollment, Course } from "../types";

const PAGE_SIZE = 8;

const Students: React.FC = () => {
  // State for real-time data
  const [students, setStudents] = useState<AppUser[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalStudent, setModalStudent] = useState<AppUser | null | "new">(null);

  // ✅ Real-time listener for students - FIXED: Looking for "user" role instead of "student"
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const studentsRef = collection(db, "users");
      // 🔥 FIX: Changed from "student" to "user" to match your data
      const q = query(studentsRef, where("role", "==", "user"));

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          console.log("📦 Students snapshot received, size:", snapshot.size);
          const studentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AppUser[];
          setStudents(studentsData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error("❌ Error fetching students:", error);
          setError("Failed to load students");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("❌ Error setting up students listener:", error);
      setError("Failed to setup students listener");
      setLoading(false);
    }
  }, []);

  // ✅ Real-time listener for enrollments
  useEffect(() => {
    try {
      const enrollmentsRef = collection(db, "enrollments");
      const unsubscribe = onSnapshot(enrollmentsRef,
        (snapshot) => {
          console.log("📦 Enrollments snapshot received, size:", snapshot.size);
          const enrollmentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Enrollment[];
          setEnrollments(enrollmentsData);
        },
        (error) => {
          console.error("❌ Error fetching enrollments:", error);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("❌ Error setting up enrollments listener:", error);
    }
  }, []);

  // ✅ Real-time listener for courses
  useEffect(() => {
    try {
      const coursesRef = collection(db, "courses");
      const unsubscribe = onSnapshot(coursesRef,
        (snapshot) => {
          console.log("📦 Courses snapshot received, size:", snapshot.size);
          const coursesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Course[];
          setCourses(coursesData);
        },
        (error) => {
          console.error("❌ Error fetching courses:", error);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("❌ Error setting up courses listener:", error);
    }
  }, []);

  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    courses.forEach(c => {
      map[c.id] = c;
    });
    return map;
  }, [courses]);

  // Latest enrollment per student -> used to show their current course
  const studentCourseMap = useMemo(() => {
    const map: Record<string, string> = {};
    const sortedEnrollments = [...enrollments].sort((a, b) => {
      const dateA = a.enrollmentDate?.toMillis?.() ?? 0;
      const dateB = b.enrollmentDate?.toMillis?.() ?? 0;
      return dateA - dateB;
    });
    
    sortedEnrollments.forEach((e) => {
      map[e.studentId] = courseMap[e.courseId]?.title || e.courseId;
    });
    return map;
  }, [enrollments, courseMap]);

  const now = new Date();
  const newThisMonth = students.filter((s) => {
    const created = s.createdAt?.toDate?.();
    return created && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const activeCount = students.filter((s) => s.status === "active").length;
  const inactiveCount = students.filter((s) => s.status === "inactive").length;

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search);
      const matchesCourse = courseFilter === "all" || studentCourseMap[s.id] === courseMap[courseFilter]?.title;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, search, courseFilter, statusFilter, studentCourseMap, courseMap]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student profile? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  const handleToggleStatus = async (s: AppUser) => {
    try {
      await updateDoc(doc(db, "users", s.id), {
        status: s.status === "active" ? "inactive" : "active",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ Error updating student status:", error);
      alert("Failed to update student status. Please try again.");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Phone", "Course", "Status"],
      ...filtered.map((s) => [s.name, s.email, s.phone || "", studentCourseMap[s.id] || "", s.status]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && students.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-[#6C63FF] animate-spin" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dashboard &gt; Students</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={() => setModalStudent("new")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New Student
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Students" value={students.length} icon={Users} color="violet" loading={loading} />
        <StatCard label="Active Students" value={activeCount} icon={UserCheck} color="blue" loading={loading} />
        <StatCard label="New This Month" value={newThisMonth} icon={UserPlus} color="green" loading={loading} />
        <StatCard label="Inactive Students" value={inactiveCount} icon={UserX} color="amber" loading={loading} />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 border-b border-slate-200 dark:border-slate-700/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search students by name, email, phone..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            // 🔥 FIX: Better dark theme visibility
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="all" className="text-slate-700 dark:text-slate-200">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="text-slate-700 dark:text-slate-200">
                {c.title}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            // 🔥 FIX: Better dark theme visibility
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="all" className="text-slate-700 dark:text-slate-200">All Status</option>
            <option value="active" className="text-slate-700 dark:text-slate-200">Active</option>
            <option value="inactive" className="text-slate-700 dark:text-slate-200">Inactive</option>
          </select>
        </div>

        {loading && students.length === 0 ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No students found" subtitle="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
                  <th className="px-4 sm:px-6 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Join Date</th>
                  <th className="px-4 sm:px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {paged.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center text-xs font-semibold shrink-0">
                          {s.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate md:hidden">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell">{s.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell">{s.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{studentCourseMap[s.id] || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleStatus(s)} className="cursor-pointer">
                        <StatusBadge label={s.status} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalStudent(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </div>

      {modalStudent && (
        <StudentModal
          student={modalStudent === "new" ? null : modalStudent}
          onClose={() => setModalStudent(null)}
        />
      )}
    </div>
  );
};

const StudentModal: React.FC<{ student: AppUser | null; onClose: () => void }> = ({
  student,
  onClose,
}) => {
  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [phone, setPhone] = useState(student?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !email) {
      alert("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      if (student) {
        await updateDoc(doc(db, "users", student.id), { 
          name, 
          email, 
          phone, 
          updatedAt: serverTimestamp() 
        });
      } else {
        await addDoc(collection(db, "users"), {
          name,
          email,
          phone: phone || "",
          role: "user", // 🔥 FIX: Using "user" instead of "student"
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (error) {
      console.error("❌ Error saving student:", error);
      alert("Failed to save student. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            {student ? "Edit Student" : "Add New Student"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name || !email}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Students;