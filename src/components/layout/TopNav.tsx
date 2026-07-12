// src/components/layout/TopNav.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Sun, Moon, ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { where } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { auth } from "../../firebase/firebase";
import { useTheme } from "../../context/ThemeContext";
import { useCollection } from "../../lib/useCollection";
import { useCurrentAdmin } from "../../lib/useCurrentAdmin";
import type { ContactMessage } from "../../types";

interface TopNavProps {
  onMenuClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { data: unread } = useCollection<ContactMessage>("messages", [where("status", "==", "unread")]);
  const admin = useCurrentAdmin();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 sm:gap-4 h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={onMenuClick}
        className="lg:hidden shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-xl hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search anything..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <button
          onClick={() => navigate("/messages")}
          className="relative h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center text-xs font-semibold overflow-hidden">
              {admin?.profileImage ? (
                <img src={admin.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                admin?.name?.charAt(0).toUpperCase() || "A"
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{admin?.name || "Admin"}</p>
              <p className="text-[11px] text-slate-400">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] shadow-lg py-1.5 z-50">
              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <UserCircle className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => {
                  navigate("/settings");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
