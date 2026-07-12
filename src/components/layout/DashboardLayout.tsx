// src/components/layout/DashboardLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FolderKanban, 
  FileText, 
  CreditCard, 
  Award, 
  MessageSquare, 
  BarChart3, 
  FileBarChart, 
  UsersRound, 
  Globe, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Shield,
  PlusCircle
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

// Import the logo image
import xeviqoLogo from "../../../public/images/aa.png";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["system", "quick-actions"]);
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.name || "Admin");
      setUserEmail(parsed.email || "");
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      setShowLogoutDialog(false);
      setIsLoggingOut(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigationItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Enrollments", path: "/admin/enrollments", icon: GraduationCap },
    { name: "Final Year Projects", path: "/admin/final-year-projects", icon: FolderKanban },
    { name: "Assignments", path: "/admin/assignments", icon: FileText },
    { name: "Approve Payments", path: "/admin/approve-payments", icon: CreditCard },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Certificates", path: "/admin/certificates", icon: Award },
    { name: "Messages", path: "/admin/messages", icon: MessageSquare },
  ];

  const reportItems = [
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Reports", path: "/admin/reports", icon: FileBarChart },
  ];

  const systemItems = [
    { name: "Users & Roles", path: "/admin/users-roles", icon: UsersRound },
    { name: "Website Content", path: "/admin/website-content", icon: Globe },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const quickActions = [
    { name: "View Website", path: "/", icon: ExternalLink, external: true },
    { name: "Add New Course", path: "/admin/courses", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-[#1E293B] border-r-2 border-slate-300 dark:border-slate-600
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]
      `}>
        {/* Brand with Logo */}
        <div className="flex items-center gap-4 px-6 py-5 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
            <img 
              src={xeviqoLogo} 
              alt="XEVIQO" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xl sm:text-2xl">XEVIQO</p>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 tracking-wider">ADMIN PANEL</p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[#6C63FF]/10 dark:bg-[#6C63FF]/20 text-[#6C63FF] shadow-sm border-2 border-[#6C63FF]/30 dark:border-[#8B5CF6]/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-[#6C63FF]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-[#6C63FF] dark:text-[#8B5CF6]" />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Reports & Analytics Section */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection("reports")}
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span>Reports & Analytics</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedSections.includes("reports") ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.includes("reports") && (
              <div className="space-y-1 mt-1 ml-4">
                {reportItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive 
                          ? 'bg-[#6C63FF]/10 dark:bg-[#6C63FF]/20 text-[#6C63FF] shadow-sm border-2 border-[#6C63FF]/30 dark:border-[#8B5CF6]/30' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-[#6C63FF]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} />
                      <span className="flex-1">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* System Section */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection("system")}
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span>System</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedSections.includes("system") ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.includes("system") && (
              <div className="space-y-1 mt-1 ml-4">
                {systemItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive 
                          ? 'bg-[#6C63FF]/10 dark:bg-[#6C63FF]/20 text-[#6C63FF] shadow-sm border-2 border-[#6C63FF]/30 dark:border-[#8B5CF6]/30' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-[#6C63FF]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} />
                      <span className="flex-1">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection("quick-actions")}
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span>Quick Actions</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                expandedSections.includes("quick-actions") ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedSections.includes("quick-actions") && (
              <div className="space-y-1 mt-1 ml-4">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.external) {
                          window.open(item.path, '_blank');
                        } else {
                          navigate(item.path);
                        }
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                    >
                      <Icon className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.external && (
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Theme Toggle in Sidebar */}
        <div className="border-t-2 border-slate-200 dark:border-slate-700 p-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 group border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <span className="flex items-center gap-3">
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {isDark ? "☀️" : "🌙"}
            </span>
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="border-t-2 border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 border-2 border-[#6C63FF]/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 border-2 border-transparent hover:border-red-200 dark:hover:border-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-lg border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white font-semibold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 dark:border-slate-600 overflow-hidden">
            <div className="p-6 border-b-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 border-2 border-red-200 dark:border-red-500/30">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Confirm Logout
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to sign out?
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 border-2 border-[#6C63FF]/30">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                You will be redirected to the login page.
              </p>
            </div>
            <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-600"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 border-2 border-red-400/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;