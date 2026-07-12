// src/pages/FinalYearProjects.tsx
import React, { useMemo, useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp, onSnapshot, query } from "firebase/firestore";
import { 
  FolderKanban, CheckCircle2, ShoppingBag, Layers, Search, Plus, 
  Pencil, Trash2, Eye, X, Loader2, Sparkles, Award, TrendingUp,
  Code, Database, Globe, Smartphone, Cloud, Shield, Zap, Cpu,
  ChevronLeft, ChevronRight, Hash, Tag, User, Calendar as CalendarIcon,
  FileText, AlertTriangle, ExternalLink, Github, Twitter, Linkedin,
  Box, Terminal, Braces, Layout, Server, Cpu as CpuIcon
} from "lucide-react";

import { db } from "../firebase/firebase";
import { formatCurrency, formatDate } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import { EmptyState, TableSkeleton, Pagination } from "../components/ui/TableHelpers";
import type { Project } from "../types";

const PAGE_SIZE = 8;
const emptyProject: Partial<Project> = {
  title: "",
  description: "",
  domain: "",
  technology: [],
  difficulty: "Medium",
  guide: "",
  price: 0,
  projectType: "Final Year",
  status: "available",
  featured: false,
  sourceCode: true,
  documentation: true,
  pptIncluded: true,
  reportIncluded: true,
};

// ============================================
// 🎨 TOAST NOTIFICATION
// ============================================
const Toast: React.FC<{
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-500",
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: "Success ✨",
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-500",
      icon: X,
      iconBg: "bg-rose-100 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      title: "Error ❌",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-500",
      icon: Sparkles,
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: "Info ℹ️",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-500",
      icon: AlertTriangle,
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: "Warning ⚠️",
    },
  };

  const { bg, border, icon: Icon, iconBg, iconColor, title } = config[type];

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] w-[calc(100%-2rem)] sm:w-[400px] animate-slide-down">
      <div className={`relative overflow-hidden rounded-2xl border-2 ${border} ${bg} p-4 shadow-2xl backdrop-blur-sm`}>
        <div className={`absolute top-0 left-0 h-1 w-full ${border.replace('border-', 'bg-')}`} />
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-xl ${iconBg} border-2 ${border}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-white">{title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎨 CONFIRM DIALOG
// ============================================
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border-2 border-rose-200 dark:border-rose-500/30 animate-scale-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors shadow-lg shadow-rose-600/20"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🏷️ STATUS BADGE
// ============================================
const StatusBadge: React.FC<{ label: string; className?: string }> = ({ label, className = "" }) => {
  const config = {
    available: {
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    sold: {
      bg: "bg-blue-100 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/30",
      text: "text-blue-700 dark:text-blue-400",
      icon: ShoppingBag,
    },
    unavailable: {
      bg: "bg-rose-100 dark:bg-rose-500/10",
      border: "border-rose-200 dark:border-rose-500/30",
      text: "text-rose-700 dark:text-rose-400",
      icon: X,
    },
    featured: {
      bg: "bg-amber-100 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: Sparkles,
    },
  };

  const status = label.toLowerCase() as keyof typeof config;
  const { bg, border, text, icon: Icon } = config[status] || config.available;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold border-2 ${bg} ${border} ${text} ${className}`}>
      <Icon className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

// ============================================
// 🎨 GET PROJECT LOGO BASED ON TITLE/DOMAIN
// ============================================
const getProjectLogo = (title: string, domain: string) => {
  const titleLower = title?.toLowerCase() || '';
  const domainLower = domain?.toLowerCase() || '';
  const searchText = titleLower + ' ' + domainLower;

  // Technology/Project specific logos
  if (searchText.includes('flutter')) {
    return {
      icon: <Box className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-sky-400 to-blue-500',
      label: 'Flutter'
    };
  }
  if (searchText.includes('react') || searchText.includes('next')) {
    return {
      icon: <Braces className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-cyan-400 to-blue-500',
      label: 'React'
    };
  }
  if (searchText.includes('node') || searchText.includes('express')) {
    return {
      icon: <Server className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-green-400 to-emerald-500',
      label: 'Node.js'
    };
  }
  if (searchText.includes('python') || searchText.includes('django') || searchText.includes('flask')) {
    return {
      icon: <Terminal className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-blue-400 to-indigo-500',
      label: 'Python'
    };
  }
  if (searchText.includes('java') || searchText.includes('spring')) {
    return {
      icon: <Coffee className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-red-400 to-orange-500',
      label: 'Java'
    };
  }
  if (searchText.includes('android') || searchText.includes('kotlin')) {
    return {
      icon: <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-green-400 to-emerald-500',
      label: 'Android'
    };
  }
  if (searchText.includes('ios') || searchText.includes('swift')) {
    return {
      icon: <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-gray-400 to-slate-500',
      label: 'iOS'
    };
  }
  if (searchText.includes('ai') || searchText.includes('machine') || searchText.includes('deep')) {
    return {
      icon: <CpuIcon className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-purple-400 to-pink-500',
      label: 'AI/ML'
    };
  }
  if (searchText.includes('data') || searchText.includes('analytics') || searchText.includes('big data')) {
    return {
      icon: <Database className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-indigo-400 to-blue-500',
      label: 'Data'
    };
  }
  if (searchText.includes('cloud') || searchText.includes('aws') || searchText.includes('azure')) {
    return {
      icon: <Cloud className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-amber-400 to-orange-500',
      label: 'Cloud'
    };
  }
  if (searchText.includes('security') || searchText.includes('cyber')) {
    return {
      icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-red-400 to-rose-500',
      label: 'Security'
    };
  }
  if (searchText.includes('game') || searchText.includes('gaming') || searchText.includes('unity')) {
    return {
      icon: <Gamepad className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-violet-400 to-purple-500',
      label: 'Game'
    };
  }
  if (searchText.includes('web') || searchText.includes('website') || searchText.includes('html')) {
    return {
      icon: <Globe className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-blue-400 to-cyan-500',
      label: 'Web'
    };
  }
  if (searchText.includes('mobile') || searchText.includes('app')) {
    return {
      icon: <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />,
      bg: 'from-emerald-400 to-teal-500',
      label: 'Mobile'
    };
  }

  // Default logo based on domain
  const domainLogos: Record<string, any> = {
    'web': { icon: <Globe className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-blue-400 to-cyan-500', label: 'Web' },
    'mobile': { icon: <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-emerald-400 to-teal-500', label: 'Mobile' },
    'ai': { icon: <CpuIcon className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-purple-400 to-pink-500', label: 'AI' },
    'data': { icon: <Database className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-indigo-400 to-blue-500', label: 'Data' },
    'cloud': { icon: <Cloud className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-amber-400 to-orange-500', label: 'Cloud' },
    'security': { icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-red-400 to-rose-500', label: 'Security' },
    'game': { icon: <Gamepad className="h-6 w-6 sm:h-7 sm:w-7" />, bg: 'from-violet-400 to-purple-500', label: 'Game' },
  };

  for (const [key, value] of Object.entries(domainLogos)) {
    if (domainLower.includes(key)) {
      return value;
    }
  }

  // Default logo
  return {
    icon: <FolderKanban className="h-6 w-6 sm:h-7 sm:w-7" />,
    bg: 'from-[#6C63FF] to-[#8B5CF6]',
    label: 'Project'
  };
};

// ============================================
// 👁️ VIEW PROJECT MODAL
// ============================================
const ViewProjectModal: React.FC<{
  project: Project;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const logo = getProjectLogo(project.title, project.domain || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 xs:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-4 xs:p-5 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 my-4 sm:my-8 animate-scale-up">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${logo.bg} flex items-center justify-center text-white border-2 border-white/20 shadow-md`}>
              {logo.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">{project.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Tag className="h-3 w-3" />
                {project.domain || 'No domain'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(project.price)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{project.difficulty}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
              <StatusBadge label={project.status} />
            </div>
          </div>

          {/* Technology Stack */}
          {project.technology && project.technology.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Technology Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.technology.map((tech, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border-2 border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Hash className="h-3 w-3 text-[#6C63FF]" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Guide and Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guide</p>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.guide || 'Not assigned'}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Features</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {project.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {project.sourceCode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs">
                    <Code className="h-3 w-3" />
                    Code
                  </span>
                )}
                {project.documentation && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs">
                    <FileText className="h-3 w-3" />
                    Docs
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row justify-end gap-3 mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full xs:w-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🏠 MAIN COMPONENT
// ============================================
const FinalYearProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalProject, setModalProject] = useState<Project | "new" | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type });
  };

  // ✅ Real-time listener for projects
  useEffect(() => {
    setLoading(true);
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef);

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
          setProjects(data);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching projects:", err);
          setLoading(false);
          showToast("Failed to load projects", "error");
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, []);

  const domains = useMemo(() => Array.from(new Set(projects.map(p => p.domain).filter(Boolean))), [projects]);

  const totalSold = useMemo(() => projects.reduce((sum, p) => sum + (p.totalSold || 0), 0), [projects]);
  const availableCount = projects.filter(p => p.status === "available").length;

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch =
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.domain?.toLowerCase().includes(search.toLowerCase()) ||
        p.guide?.toLowerCase().includes(search.toLowerCase()) ||
        p.technology?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesDomain = domainFilter === "all" || p.domain === domainFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [projects, search, domainFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      showToast("Project deleted successfully! 🗑️", "success");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete project", "error");
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#6C63FF] animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={() => {
          handleDelete(confirmDialog.id);
          setConfirmDialog({ isOpen: false, id: "" });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, id: "" })}
      />

      <div className="max-w-7xl mx-auto space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
        
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-3 xs:p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-2 xs:p-2.5 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
                <FolderKanban className="h-5 w-5 xs:h-6 xs:w-6" />
              </div>
              <div>
                <h1 className="text-base xs:text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Final Year Projects
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Manage all final year projects
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalProject("new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6C63FF]/30 px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] w-full xs:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
              <Sparkles className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* STAT CARDS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} color="violet" loading={loading} />
          <StatCard label="Available" value={availableCount} icon={CheckCircle2} color="blue" loading={loading} />
          <StatCard label="Units Sold" value={totalSold} icon={ShoppingBag} color="green" loading={loading} />
          <StatCard label="Domains" value={domains.length} icon={Layers} color="amber" loading={loading} />
        </div>

        {/* ============================================ */}
        {/* MAIN TABLE */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="p-3 xs:p-4 sm:p-6 flex flex-col sm:flex-row flex-wrap gap-3 border-b-2 border-slate-200 dark:border-slate-700">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search projects..."
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={domainFilter}
                onChange={(e) => {
                  setDomainFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[140px]"
              >
                <option value="all" className="text-slate-700 dark:text-slate-200">🏷️ All Domains</option>
                {domains.map(d => (
                  <option key={d} value={d} className="text-slate-700 dark:text-slate-200">{d}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors min-w-[140px]"
              >
                <option value="all" className="text-slate-700 dark:text-slate-200">📊 All Status</option>
                <option value="available" className="text-slate-700 dark:text-slate-200">✅ Available</option>
                <option value="sold" className="text-slate-700 dark:text-slate-200">🛒 Sold</option>
                <option value="unavailable" className="text-slate-700 dark:text-slate-200">🚫 Unavailable</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState title="No projects found" subtitle="Try adjusting your search or add a new project." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs xs:text-sm">
                <thead>
                  <tr className="text-left text-[10px] xs:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <th className="px-3 sm:px-6 py-3 font-semibold">Project</th>
                    <th className="px-3 py-3 font-semibold hidden md:table-cell">Domain</th>
                    <th className="px-3 py-3 font-semibold hidden lg:table-cell">Technology</th>
                    <th className="px-3 py-3 font-semibold hidden xl:table-cell">Guide</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold hidden sm:table-cell">Status</th>
                    <th className="px-3 sm:px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700/40">
                  {paged.map((p) => {
                    const logo = getProjectLogo(p.title, p.domain || '');
                    
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 sm:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br ${logo.bg} flex items-center justify-center text-white border-2 border-white/20 shadow-md shrink-0`}>
                              {logo.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
                                  {p.title}
                                </p>
                                {p.featured && (
                                  <span className="hidden sm:inline">
                                    <StatusBadge label="Featured" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]">
                                {p.description}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-1 md:hidden">
                                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-slate-400">
                                  🏷️ {p.domain || "—"}
                                </span>
                                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-slate-400">
                                  💰 {formatCurrency(p.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <div className={`p-1 rounded-lg bg-gradient-to-br ${logo.bg} text-white`}>
                              {logo.icon}
                            </div>
                            <StatusBadge label={p.domain || "—"} />
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell text-xs">
                          <div className="flex flex-wrap gap-1">
                            {p.technology?.slice(0, 2).map((tech, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">
                                <Hash className="h-2.5 w-2.5 text-slate-400" />
                                {tech}
                              </span>
                            ))}
                            {p.technology && p.technology.length > 2 && (
                              <span className="text-[10px] text-slate-400">+{p.technology.length - 2}</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300 hidden xl:table-cell text-xs">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {p.guide || "—"}
                          </div>
                        </td>
                        
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30 font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                            <Tag className="h-3 w-3" />
                            {formatCurrency(p.price)}
                          </span>
                        </td>
                        
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <StatusBadge label={p.status} />
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            <button 
                              onClick={() => setViewProject(p)}
                              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/20 transition-all"
                              title="View"
                            >
                              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => setModalProject(p)}
                              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 border-2 border-transparent hover:border-[#6C63FF]/20 transition-all"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ isOpen: true, id: p.id })}
                              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border-2 border-transparent hover:border-rose-500/20 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* VIEW PROJECT MODAL */}
      {/* ============================================ */}
      {viewProject && (
        <ViewProjectModal
          project={viewProject}
          onClose={() => setViewProject(null)}
        />
      )}

      {/* ============================================ */}
      {/* CREATE/EDIT PROJECT MODAL */}
      {/* ============================================ */}
      {modalProject && (
        <ProjectModal
          project={modalProject === "new" ? null : modalProject}
          onClose={() => setModalProject(null)}
          onSuccess={() => {
            showToast(
              modalProject === "new" 
                ? "Project created successfully! 🎉" 
                : "Project updated successfully! ✨",
              "success"
            );
          }}
          onError={(message) => {
            showToast(message || "Failed to save project", "error");
          }}
        />
      )}
    </div>
  );
};

// ============================================
// 📝 PROJECT MODAL
// ============================================
const ProjectModal: React.FC<{
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ project, onClose, onSuccess, onError }) => {
  const [form, setForm] = useState<Partial<Project>>(project || emptyProject);
  const [techInput, setTechInput] = useState(project?.technology?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Project, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.title) {
      onError("Project title is required");
      return;
    }

    setSaving(true);
    try {
      const technology = techInput
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      
      const payload = { 
        ...form, 
        technology,
        updatedAt: serverTimestamp(),
      };
      
      if (project) {
        await updateDoc(doc(db, "projects", project.id), payload);
        onSuccess();
        onClose();
      } else {
        await addDoc(collection(db, "projects"), {
          ...payload,
          totalSold: 0,
          createdAt: serverTimestamp(),
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error("Error saving:", err);
      let message = "Failed to save project. ";
      if (err.message?.includes("permission-denied")) {
        message = "Permission denied. Please check Firestore security rules.";
      } else {
        message += err.message || "Please try again.";
      }
      onError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 xs:p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl xs:rounded-3xl bg-white dark:bg-[#1E293B] p-3 xs:p-4 sm:p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-700 my-2 xs:my-4 sm:my-8 animate-scale-up">
        
        <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="p-1.5 xs:p-2 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] text-white">
              <FolderKanban className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm xs:text-base sm:text-lg md:text-xl text-slate-900 dark:text-white">
                {project ? "Edit Project" : "Add New Project"}
              </h3>
              <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400">
                {project ? "Update project details" : "Create a new final year project"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 xs:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <X className="h-4 w-4 xs:h-5 xs:w-5 text-slate-400" />
          </button>
        </div>
        
        {/* Responsive Grid - Horizontal on desktop, Vertical on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
          {/* Left Column */}
          <div className="space-y-3 xs:space-y-4">
            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.title || ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter project title..."
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Domain
              </label>
              <input
                value={form.domain || ""}
                onChange={(e) => set("domain", e.target.value)}
                placeholder="e.g. Web Development"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Guide Name
              </label>
              <input
                value={form.guide || ""}
                onChange={(e) => set("guide", e.target.value)}
                placeholder="Guide name"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Technology Stack
              </label>
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React, Node.js, MongoDB"
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              />
              <p className="text-[9px] xs:text-[10px] text-slate-400 mt-1">Separate technologies with commas</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 xs:space-y-4">
            <div className="grid grid-cols-2 gap-2 xs:gap-3">
              <div>
                <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                  Difficulty
                </label>
                <select
                  value={form.difficulty || "Medium"}
                  onChange={(e) => set("difficulty", e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
                >
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                  Price
                </label>
                <input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => set("price", e.target.value ? Number(e.target.value) : 0)}
                  placeholder="Enter price"
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Status
              </label>
              <select
                value={form.status || "available"}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors"
              >
                <option value="available">✅ Available</option>
                <option value="sold">🛒 Sold</option>
                <option value="unavailable">🚫 Unavailable</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] xs:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Description
              </label>
              <textarea
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the project..."
                rows={2}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-3 xs:px-4 py-2 xs:py-3 text-xs xs:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 xs:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-xs sm:text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!form.featured} 
                  onChange={(e) => set("featured", e.target.checked)}
                  className="w-3 h-3 xs:w-4 xs:h-4 accent-[#6C63FF]"
                />
                <Sparkles className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-amber-500" />
                Featured
              </label>
              <label className="flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-xs sm:text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!form.sourceCode} 
                  onChange={(e) => set("sourceCode", e.target.checked)}
                  className="w-3 h-3 xs:w-4 xs:h-4 accent-[#6C63FF]"
                />
                <Code className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-blue-500" />
                Code
              </label>
              <label className="flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-xs sm:text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!form.documentation} 
                  onChange={(e) => set("documentation", e.target.checked)}
                  className="w-3 h-3 xs:w-4 xs:h-4 accent-[#6C63FF]"
                />
                <FileText className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-emerald-500" />
                Docs
              </label>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 mt-4 xs:mt-5 sm:mt-6 pt-4 xs:pt-5 sm:pt-6 border-t-2 border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full xs:w-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors order-2 xs:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title}
            className="w-full xs:w-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed order-1 xs:order-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/30 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {project ? "Update" : "Create"}
                <Sparkles className="h-3 w-3 xs:h-4 xs:w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add missing imports for Coffee and Gamepad
import { Coffee, Gamepad } from "lucide-react";

export default FinalYearProjects;