// src/pages/UsersRoles.tsx
// Staff accounts live in the same `users` collection as students, just with
// role != "student". Role permission matrices are a new `roles` collection
// (id = role key), editable below.
import React, { useMemo, useState } from "react";
import { where, doc, updateDoc, deleteDoc, addDoc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { UserCog, ShieldCheck, Users2, Plus, Pencil, Trash2, X } from "lucide-react";

import { db } from "../firebase/firebase"; // ✅ Fixed import path
import { useCollection } from "../lib/useCollection";
import { formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton } from "../components/ui/TableHelpers";
import type { AppUser, RoleDefinition } from "../types";

const DEFAULT_PERMISSIONS: RoleDefinition["permissions"] = {
  manageStudents: true,
  manageCourses: true,
  managePayments: true,
  manageContent: true,
  manageUsers: true,
};

const permissionLabels: Record<keyof RoleDefinition["permissions"], string> = {
  manageStudents: "Manage Students",
  manageCourses: "Manage Courses",
  managePayments: "Manage Payments",
  manageContent: "Manage Website Content",
  manageUsers: "Manage Users & Roles",
};

const UsersRoles: React.FC = () => {
  const { data: staff, loading } = useCollection<AppUser>("users", [where("role", "!=", "student")]);
  const { data: roles } = useCollection<RoleDefinition>("roles");

  const [tab, setTab] = useState<"users" | "roles">("users");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userModal, setUserModal] = useState<AppUser | "new" | null>(null);
  const [roleModal, setRoleModal] = useState<RoleDefinition | "new" | null>(null);

  const roleNames = useMemo(() => Array.from(new Set(staff.map((s) => s.role))), [staff]);
  const activeCount = staff.filter((s) => s.status === "active").length;

  const filtered = useMemo(
    () => (roleFilter === "all" ? staff : staff.filter((s) => s.role === roleFilter)),
    [staff, roleFilter]
  );

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remove this user's access?")) return;
    await deleteDoc(doc(db, "users", id));
  };

  const handleToggleStatus = async (u: AppUser) => {
    await updateDoc(doc(db, "users", u.id), {
      status: u.status === "active" ? "inactive" : "active",
      updatedAt: serverTimestamp(),
    });
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Delete this role definition?")) return;
    await deleteDoc(doc(db, "roles", id));
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Users &amp; Roles</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage staff accounts and permission roles.</p>
        </div>
        {tab === "users" ? (
          <button
            onClick={() => setUserModal("new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Add Staff User
          </button>
        ) : (
          <button
            onClick={() => setRoleModal("new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Add Role
          </button>
        )}
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Total Staff" value={staff.length} icon={Users2} color="violet" loading={loading} />
        <StatCard label="Active Users" value={activeCount} icon={UserCog} color="blue" loading={loading} />
        <StatCard label="Defined Roles" value={roles.length} icon={ShieldCheck} color="green" />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-1.5 bg-white dark:bg-[#1E293B] w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setTab("users")}
          className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none ${
            tab === "users" ? "bg-[#6C63FF] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setTab("roles")}
          className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none ${
            tab === "roles" ? "bg-[#6C63FF] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Role Permissions
        </button>
      </div>

      {/* Users Tab */}
      {tab === "users" ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5 border-b border-slate-200 dark:border-slate-700/60">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              {roleNames.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState title="No staff users found" subtitle="Add trainers, editors, or other admin accounts." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium">User</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden md:table-cell">Email</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Role</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Status</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium hidden sm:table-cell">Added</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0">
                            {u.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm">
                              {u.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate md:hidden">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell text-xs sm:text-sm">
                        {u.email}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <StatusBadge label={u.role} />
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <button onClick={() => handleToggleStatus(u)}>
                          <StatusBadge label={u.status} />
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell text-xs sm:text-sm">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button 
                            onClick={() => setUserModal(u)} 
                            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)} 
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
        </div>
      ) : (
        // Roles Tab
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {roles.length === 0 ? (
            <div className="sm:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B]">
              <EmptyState title="No roles defined yet" subtitle="Add a role to configure its permissions." />
            </div>
          ) : (
            roles.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white capitalize">
                    {r.label}
                  </p>
                  <div className="flex gap-0.5 sm:gap-1">
                    <button 
                      onClick={() => setRoleModal(r)} 
                      className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(r.id)} 
                      className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {(Object.keys(permissionLabels) as (keyof RoleDefinition["permissions"])[]).map((key) => (
                    <div key={key} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{permissionLabels[key]}</span>
                      <StatusBadge label={r.permissions[key] ? "Allowed" : "Denied"} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {userModal && <UserModal user={userModal === "new" ? null : userModal} onClose={() => setUserModal(null)} />}
      {roleModal && <RoleModal role={roleModal === "new" ? null : roleModal} onClose={() => setRoleModal(null)} />}
    </div>
  );
};

const UserModal: React.FC<{ user: AppUser | null; onClose: () => void }> = ({ user, onClose }) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "trainer");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user) {
        await updateDoc(doc(db, "users", user.id), { name, email, role, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "users"), {
          name,
          email,
          role,
          status: "active",
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
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
            {user ? "Edit User" : "Add Staff User"}
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="support">Support</option>
            <option value="editor">Editor</option>
          </select>
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
            disabled={saving || !name || !email}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 order-1 sm:order-2"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoleModal: React.FC<{ role: RoleDefinition | null; onClose: () => void }> = ({ role, onClose }) => {
  const [label, setLabel] = useState(role?.label || "");
  const [permissions, setPermissions] = useState<RoleDefinition["permissions"]>(
    role?.permissions || DEFAULT_PERMISSIONS
  );
  const [saving, setSaving] = useState(false);

  const togglePerm = (key: keyof RoleDefinition["permissions"]) =>
    setPermissions((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = role?.id || label.toLowerCase().replace(/\s+/g, "-");
      await setDoc(
        doc(db, "roles", id),
        { label, permissions, updatedAt: serverTimestamp(), ...(role ? {} : { createdAt: serverTimestamp() }) },
        { merge: true }
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
            {role ? "Edit Role" : "Add Role"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Role name (e.g. Trainer)"
          disabled={!!role}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 disabled:opacity-60 mb-4"
        />
        <div className="space-y-2">
          {(Object.keys(permissionLabels) as (keyof RoleDefinition["permissions"])[]).map((key) => (
            <label key={key} className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <span>{permissionLabels[key]}</span>
              <input 
                type="checkbox" 
                checked={permissions[key]} 
                onChange={() => togglePerm(key)} 
                className="w-4 h-4 accent-[#6C63FF]"
              />
            </label>
          ))}
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
            disabled={saving || !label}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 order-1 sm:order-2"
          >
            {saving ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersRoles;