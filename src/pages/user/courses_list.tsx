// src/pages/user/courses_list.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, Clock, User, BookOpen, Star, Award, 
  ChevronRight, GraduationCap, Users, Calendar, DollarSign,
  Sparkles, TrendingUp, Layers, PlayCircle, Info, X,
  Tag, Code, BarChart, Globe, CheckCircle, ExternalLink,
  Grid, List, Heart, Share2, Bookmark
} from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import type { Course } from "../../types";
import { formatCurrency } from "../../lib/format";
import StatusBadge from "../../components/ui/StatusBadge";

const PAGE_SIZE = 8;

// Technology-specific logos and colors
const techLogos: Record<string, { icon: string; color: string; bg: string }> = {
  java: { icon: "☕", color: "#007396", bg: "#f8f4f0" },
  python: { icon: "🐍", color: "#3776AB", bg: "#f0f4f8" },
  javascript: { icon: "🟨", color: "#F7DF1E", bg: "#fef9e7" },
  react: { icon: "⚛️", color: "#61DAFB", bg: "#e8f4f8" },
  nodejs: { icon: "🟩", color: "#339933", bg: "#e8f5e9" },
  angular: { icon: "🅰️", color: "#DD0031", bg: "#fde8ec" },
  vue: { icon: "🟢", color: "#4FC08D", bg: "#e8f5f0" },
  mongodb: { icon: "🍃", color: "#47A248", bg: "#e8f5e8" },
  mysql: { icon: "🐬", color: "#4479A1", bg: "#eef4f8" },
  php: { icon: "🐘", color: "#777BB4", bg: "#f0eff5" },
  csharp: { icon: "🔷", color: "#239120", bg: "#e8f0e8" },
  cpp: { icon: "⚡", color: "#00599C", bg: "#e8eff5" },
  ruby: { icon: "💎", color: "#CC342D", bg: "#fde8e8" },
  swift: { icon: "🦅", color: "#FA7343", bg: "#fef0e8" },
  kotlin: { icon: "🎯", color: "#7F52FF", bg: "#f0ecff" },
  go: { icon: "🐹", color: "#00ADD8", bg: "#e8f4f8" },
  rust: { icon: "🦀", color: "#000000", bg: "#f0f0f0" },
  docker: { icon: "🐳", color: "#2496ED", bg: "#e8f2fa" },
  kubernetes: { icon: "⚓", color: "#326CE5", bg: "#e8effa" },
  aws: { icon: "☁️", color: "#FF9900", bg: "#fef5e8" },
  azure: { icon: "🔷", color: "#0078D4", bg: "#e8f2fa" },
  gcp: { icon: "🔵", color: "#4285F4", bg: "#e8effa" },
  default: { icon: "📚", color: "#6C63FF", bg: "#f0ecff" }
};

// Generate course image with technology logo
const generateCourseImage = (course: Course): string => {
  const tech = course.technology?.toLowerCase() || 'default';
  const techInfo = techLogos[tech] || techLogos.default;
  const title = encodeURIComponent(course.title || 'Course');
  const bgColor = techInfo.bg.replace('#', '');
  const textColor = techInfo.color.replace('#', '');
  
  return `https://ui-avatars.com/api/?name=${title}&background=${bgColor}&color=${textColor}&size=400&font-size=0.5&bold=true&rounded=true`;
};

// Generate tech icon badge
const TechBadge: React.FC<{ technology: string }> = ({ technology }) => {
  const tech = technology?.toLowerCase() || 'default';
  const techInfo = techLogos[tech] || techLogos.default;
  
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: techInfo.bg,
        color: techInfo.color,
        border: `1px solid ${techInfo.color}20`
      }}
    >
      <span className="text-base">{techInfo.icon}</span>
      {technology}
    </div>
  );
};

// Course Card Component
const CourseCard: React.FC<{ 
  course: Course; 
  onEnroll: (course: Course) => void;
  onView: (course: Course) => void;
}> = ({ course, onEnroll, onView }) => {
  const tech = course.technology?.toLowerCase() || 'default';
  const techInfo = techLogos[tech] || techLogos.default;
  const isDiscounted = course.discountPrice && course.discountPrice < course.price;
  const discountPercent = isDiscounted && course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700/60 transition-all duration-300 hover:-translate-y-1">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#6C63FF]/10 to-[#6C63FF]/5">
        <img 
          src={course.courseImage || generateCourseImage(course)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&background=6C63FF&color=fff&size=200`;
          }}
        />
        
        {/* Featured Badge */}
        {course.featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          </div>
        )}
        
        {/* Discount Badge */}
        {isDiscounted && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              {discountPercent}% OFF
            </span>
          </div>
        )}
        
        {/* Tech Icon Overlay */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{techInfo.icon}</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {course.technology}
            </span>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-4">
        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
            <Tag className="h-3 w-3" />
            {course.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
            <BarChart className="h-3 w-3" />
            {course.level}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-[#6C63FF] dark:group-hover:text-[#7C6BFF] transition-colors">
          {course.title}
        </h3>
        
        {/* Trainer */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <User className="h-3.5 w-3.5" />
          <span>{course.trainerName || "Instructor"}</span>
        </div>
        
        {/* Description */}
        {course.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
            {course.description}
          </p>
        )}
        
        {/* Course Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Globe className="h-3.5 w-3.5" />
            <span>{course.mode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="h-3.5 w-3.5" />
            <span>{course.totalStudents || 0} students</span>
          </div>
          {course.certificate && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Award className="h-3.5 w-3.5" />
              <span>Certificate</span>
            </div>
          )}
        </div>
        
        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/60">
          <div>
            {isDiscounted ? (
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(course.discountPrice)}
                </span>
                <span className="ml-2 text-sm text-slate-400 line-through">
                  {formatCurrency(course.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(course.price)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onView(course)}
              className="p-2 rounded-xl text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
              title="View Details"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEnroll(course)}
              className="inline-flex items-center gap-1.5 bg-[#6C63FF] hover:bg-[#5b53e6] text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-300 hover:scale-105"
            >
              Enroll Now
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CoursesList: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, loading } = useCollection<Course>("courses");
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [techFilter, setTechFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get unique filters
  const categories = useMemo(() => {
    const cats = new Set(courses.filter(c => c.status === 'active').map(c => c.category).filter(Boolean));
    return Array.from(cats);
  }, [courses]);

  const technologies = useMemo(() => {
    const techs = new Set(courses.filter(c => c.status === 'active').map(c => c.technology).filter(Boolean));
    return Array.from(techs);
  }, [courses]);

  const levels = ["Beginner", "Intermediate", "Advanced"];

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(c => c.status === 'active');
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(searchLower) ||
        c.trainerName?.toLowerCase().includes(searchLower) ||
        c.category?.toLowerCase().includes(searchLower) ||
        c.technology?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(c => c.level === levelFilter);
    }
    
    // Technology filter
    if (techFilter !== "all") {
      filtered = filtered.filter(c => c.technology === techFilter);
    }
    
    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "newest":
        filtered.sort((a, b) => {
          const getTime = (val: any) => {
            if (!val) return 0;
            // Firestore Timestamp has toDate()
            if (typeof val === "object" && "toDate" in val && typeof val.toDate === "function") {
              return val.toDate().getTime();
            }
            return new Date(val).getTime() || 0;
          };

          const dateA = getTime(a.createdAt);
          const dateB = getTime(b.createdAt);
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
    
    return filtered;
  }, [courses, search, categoryFilter, levelFilter, techFilter, sortBy]);

  // Pagination
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, page]);

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, levelFilter, techFilter, sortBy]);

  // ✅ Updated: Navigate to payment page with course data
  const handleEnroll = (course: Course) => {
    // Check if course has an ID
    if (!course.id) {
      console.error("Course ID is missing");
      return;
    }
    
    // Navigate to payment page with course data
    navigate(`/user/payment/${course.id}`, { 
      state: { course },
      replace: false
    });
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700/60 animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-[#6C63FF]" />
              Available Courses
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Discover and enroll in professional courses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] px-3 py-1.5 rounded-xl font-medium">
              {filteredCourses.length} courses available
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/60 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, instructor, or category..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2.5 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filters</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? 'bg-white dark:bg-[#1E293B] shadow-sm text-[#6C63FF]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? 'bg-white dark:bg-[#1E293B] shadow-sm text-[#6C63FF]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">All Technologies</option>
              {technologies.map((tech) => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="all">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Course Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {paginatedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              onView={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700/60 transition-all duration-300 p-4 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={course.courseImage || generateCourseImage(course)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&background=6C63FF&color=fff&size=200`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                    <Tag className="h-3 w-3" />
                    {course.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                    <BarChart className="h-3 w-3" />
                    {course.level}
                  </span>
                  {course.featured && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {course.trainerName || "Instructor"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.totalStudents || 0} students
                  </span>
                  {course.certificate && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Award className="h-3.5 w-3.5" />
                      Certificate
                    </span>
                  )}
                </div>
                {course.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
                    {course.description}
                  </p>
                )}
              </div>
              <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 sm:min-w-[140px]">
                <div className="text-center">
                  {course.discountPrice && course.discountPrice < course.price ? (
                    <>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(course.discountPrice)}
                      </span>
                      <span className="ml-2 text-sm text-slate-400 line-through block sm:inline">
                        {formatCurrency(course.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(course.price)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleEnroll(course)}
                  className="inline-flex items-center gap-1.5 bg-[#6C63FF] hover:bg-[#5b53e6] text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
                >
                  Enroll Now
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredCourses.length)} of {filteredCourses.length} courses
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-[#6C63FF] text-white text-sm font-medium">
              {page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
};

// Course Detail Modal
const CourseDetailModal: React.FC<{ 
  course: Course; 
  onClose: () => void;
  onEnroll: (course: Course) => void;
}> = ({ course, onClose, onEnroll }) => {
  const tech = course.technology?.toLowerCase() || 'default';
  const techInfo = techLogos[tech] || techLogos.default;
  const isDiscounted = typeof course.discountPrice === 'number' && course.discountPrice < course.price;
  const discountPercent = isDiscounted 
    ? Math.round(((course.price - (course.discountPrice ?? course.price)) / course.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1E293B] p-4 sm:p-6 shadow-xl my-4 sm:my-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={course.courseImage || generateCourseImage(course)}
                alt={course.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&background=6C63FF&color=fff&size=200`;
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge label={course.status === "active" ? "Published" : course.status} />
                {course.featured && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Course Image Large */}
        <div className="relative h-56 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#6C63FF]/10 to-[#6C63FF]/5">
          <img 
            src={course.courseImage || generateCourseImage(course)}
            alt={course.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&background=6C63FF&color=fff&size=200`;
            }}
          />
          <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{techInfo.icon}</span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Technology</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{course.technology}</p>
              </div>
            </div>
          </div>
          {isDiscounted && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{course.category}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">Level</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{course.level}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{course.duration}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">Mode</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{course.mode}</p>
          </div>
        </div>

        {/* Trainer Info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl mb-4">
          <div className="h-10 w-10 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center font-bold">
            {course.trainerName?.charAt(0) || "I"}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instructor</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{course.trainerName || "Instructor"}</p>
          </div>
        </div>

        {/* Description */}
        {course.description && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
          </div>
        )}

        {/* Course Stats */}
        <div className="flex flex-wrap gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl mb-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <Users className="h-4 w-4" /> {course.totalStudents || 0} Students
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <BookOpen className="h-4 w-4" /> {course.totalAssignments || 0} Assignments
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <Layers className="h-4 w-4" /> {course.totalProjects || 0} Projects
          </span>
          {course.certificate && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" /> Certificate Included
            </span>
          )}
        </div>

        {/* Price & Enroll */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/60">
          <div>
            {isDiscounted ? (
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(course.discountPrice)}
                </span>
                <span className="ml-2 text-sm text-slate-400 line-through">
                  {formatCurrency(course.price)}
                </span>
                <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Save {discountPercent}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(course.price)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onClose();
              onEnroll(course);
            }}
            className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5b53e6] text-white text-base font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Enroll Now
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursesList;