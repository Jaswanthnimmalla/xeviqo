// src/components/layout/UserLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Award, 
  MessageSquare, 
  CreditCard, 
  User, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  Bell,
  ChevronDown,
  Megaphone,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Library,
  Crown
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Motivational quotes
  const quotes = [
    "📚 Knowledge is power! Keep learning every day.",
    "🚀 The expert in anything was once a beginner.",
    "💪 Small steps lead to big achievements.",
    "🌟 Your future is created by what you do today.",
    "🎯 Focus on progress, not perfection.",
    "🔥 Stay hungry. Stay foolish. Keep learning.",
    "✨ Every expert was once a beginner.",
    "📈 Growth happens outside your comfort zone.",
    "💡 Learn something new every single day.",
    "⭐ Believe in your potential and never give up.",
    "🚀 Start where you are. Use what you have.",
    "🎓 Education is the most powerful weapon.",
  ];

  // Colors for blinking effect
  const colors = [
    "text-[#6C63FF] dark:text-[#8B5CF6]",
    "text-[#FF6B6B] dark:text-[#FF8A8A]",
    "text-[#4ECDC4] dark:text-[#6EE7D6]",
    "text-[#FFA94D] dark:text-[#FFBE76]",
    "text-[#A29BFE] dark:text-[#C8C4FF]",
    "text-[#FD79A8] dark:text-[#FF9FC4]",
    "text-[#00B894] dark:text-[#55EFC4]",
    "text-[#FDCB6E] dark:text-[#FFEAA7]",
    "text-[#E17055] dark:text-[#FF7675]",
    "text-[#74B9FF] dark:text-[#A8D8FF]",
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }, 6000);

    const colorInterval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 2000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(colorInterval);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.name || "User");
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

  // Get unread messages count
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const q = query(
      collection(db, "chatThreads"),
      where("studentId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.unreadCount && data.unreadCount > 0) {
          totalUnread += data.unreadCount;
        }
      });
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
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

  const navigation = [
    { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "Courses", path: "/user/courses", icon: Library },
    { name: "My Courses", path: "/user/my-courses", icon: BookOpen },
    { name: "Enrollments", path: "/user/enrollments", icon: GraduationCap },
    { name: "Assignments", path: "/user/assignments", icon: FileText },
    { name: "Final Year Projects", path: "/user/final-year-projects", icon: FileText },
    { name: "Certificates", path: "/user/certificates", icon: Award },
    { name: "Messages", path: "/user/messages", icon: MessageSquare },
    { name: "Announcements", path: "/user/announcements", icon: Megaphone },
    { name: "Payments", path: "/user/payments", icon: CreditCard },
    { name: "Profile", path: "/user/profile", icon: User },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-[#1E293B] border-r-2 border-slate-300 dark:border-slate-600
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]
      `}>
        {/* Brand with 3D Curved X - Centered */}
        <div className="flex flex-col items-center justify-center px-4 py-5 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center w-full">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="relative inline-block">
                <span className="absolute -inset-1 text-[#6C63FF] blur-sm opacity-30 select-none">X</span>
                <span className="relative bg-gradient-to-r from-[#6C63FF] via-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent animate-gradient">
                  X
                </span>
              </span>
              <span className="text-slate-800 dark:text-white/80 font-light text-xl sm:text-2xl ml-0.5">
                eviqo
              </span>
            </h1>
          </div>
          {/* User Dashboard label - Centered under brand */}
          <div className="w-full mt-0.5">
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase font-semibold text-center">
              User Dashboard
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showBadge = item.name === "Messages" && unreadCount > 0;
              
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
                  {showBadge && (
                    <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-0.5 min-w-[20px] text-center border-2 border-white dark:border-slate-700">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-[#6C63FF] dark:text-[#8B5CF6] animate-pulse" />
                  )}
                  {!isActive && (
                    <ChevronRight className="h-4 w-4 text-transparent group-hover:text-slate-300 dark:group-hover:text-slate-600 transition-colors" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Theme Toggle */}
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
          
          {/* Logout Button - Professional with colors */}
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 border-2 border-rose-400/30 hover:border-rose-300/50 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
            <Crown className="h-3.5 w-3.5 text-amber-300/70" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-lg border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center px-2 sm:px-4 md:px-6 py-2 sm:py-3">
            {/* Left - Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex-shrink-0 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            
            {/* Center - Motivational Quote */}
            <div className="flex-1 flex items-center justify-center px-2 sm:px-3 md:px-4 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full justify-center">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6C63FF] dark:text-[#8B5CF6] flex-shrink-0 animate-pulse" />
                <p className={`
                  text-[11px] xs:text-xs sm:text-sm md:text-base font-bold 
                  ${colors[colorIndex]} 
                  transition-colors duration-500 ease-in-out 
                  text-center flex-1 min-w-0
                  animate-blink
                `}>
                  {currentQuote}
                </p>
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6C63FF] dark:text-[#8B5CF6] flex-shrink-0 animate-pulse" />
              </div>
            </div>
            
            {/* Right - Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 border-2 border-slate-200 dark:border-slate-600 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6]"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <>
                    <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                    <span className="hidden xs:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                    <span className="hidden xs:inline">Dark</span>
                  </>
                )}
              </button>

              {/* Notification Bell */}
              <button 
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1E293B] border-2 border-white dark:border-slate-700">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                  aria-label="User menu"
                >
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs flex-shrink-0 border-2 border-[#6C63FF]/30">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-600 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b-2 border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <NavLink
                      to="/user/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-l-2 border-transparent hover:border-[#6C63FF]"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowLogoutDialog(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-l-2 border-transparent hover:border-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 dark:border-slate-600 overflow-hidden animate-scaleIn">
            {/* Dialog Header */}
            <div className="p-6 border-b-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 border-2 border-red-200 dark:border-red-500/30">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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

            {/* Dialog Body */}
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

            {/* Dialog Footer */}
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
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 border-2 border-rose-400/30 disabled:opacity-70 disabled:cursor-not-allowed"
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

export default UserLayout;