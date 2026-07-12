// src/components/layout/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  FolderKanban,
  FileText,
  Wallet,
  Award,
  MessageSquare,
  BarChart3,
  FileBarChart,
  UserCog,
  Layout as LayoutIcon,
  Settings,
  UserCircle,
  LogOut,
  X,
  Home,
  ShoppingBag,
  Briefcase,
  Calendar,
  Mail,
  Shield,
  Globe,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// Main Navigation Items
const mainNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
  { to: "/admin/final-year-projects", label: "Final Year Projects", icon: FolderKanban },
  { to: "/admin/assignments", label: "Assignments", icon: FileText },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
];

// Reports & Analytics Items
const reportsNavItems = [
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
];

// System Items
const systemNavItems = [
  { to: "/admin/users-roles", label: "Users & Roles", icon: UserCog },
  { to: "/admin/website-content", label: "Website Content", icon: LayoutIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

// Quick Actions for Website Navigation (Optional)
const quickActions = [
  { to: "/", label: "View Website", icon: Globe, external: false },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const handleLogout = async () => {
    if (!confirm("Log out of the admin panel?")) return;
    await signOut(auth);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] shrink-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold">
              X
            </div>
            <div className="leading-tight">
              <p className="font-bold text-slate-900 dark:text-white text-sm">XEVIQO</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">ADMIN PANEL</p>
            </div>
          </NavLink>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#6C63FF] text-white shadow-[0_0_0_1px_rgba(108,99,255,0.3),0_0_20px_rgba(108,99,255,0.35)]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
                {!item.to.startsWith("/admin") && (
                  <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">public</span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Reports & Analytics */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Reports &amp; Analytics
            </p>
            <div className="space-y-1">
              {reportsNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#6C63FF] text-white shadow-[0_0_0_1px_rgba(108,99,255,0.3),0_0_20px_rgba(108,99,255,0.35)]"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* System */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              System
            </p>
            <div className="space-y-1">
              {systemNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#6C63FF] text-white shadow-[0_0_0_1px_rgba(108,99,255,0.3),0_0_20px_rgba(108,99,255,0.35)]"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Quick Actions (Optional) */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Quick Actions
            </p>
            <div className="space-y-1">
              <NavLink
                to="/"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#6C63FF] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Globe className="h-[18px] w-[18px] shrink-0" />
                <span>View Website</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Bottom section - Profile & Logout */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <NavLink
            to="/admin/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#6C63FF] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <UserCircle className="h-[18px] w-[18px] shrink-0" />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;