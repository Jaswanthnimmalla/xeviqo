// App.tsx
import VersionChecker from './components/VersionChecker'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, Suspense, lazy, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollProgress from './components/layout/ScrollProgress'

import Home from './pages/Home'
import About from './pages/About'
import Training from './pages/Training'
import CourseDetail from './pages/CourseDetail'
import Projects from './pages/Projects'
import Services from './pages/Services'
import Careers from './pages/Careers'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

import DashboardLayout from './components/layout/DashboardLayout'
import UserLayout from './components/layout/UserLayout'
import { auth, db } from './firebase/firebase'

// ========== PROTECTED ROUTE COMPONENTS ==========

// Admin Protected Route
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
            navigate('/admin/login')
          }
        } catch (error) {
          console.error('Error checking user role:', error)
          setIsAuthenticated(false)
          navigate('/admin/login')
        }
      } else {
        setIsAuthenticated(false)
        navigate('/admin/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="h-8 w-8 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// User Protected Route
const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Allow both 'user' and 'admin' roles to access user dashboard
            if (userData.role === 'user' || userData.role === 'admin') {
              setIsAuthenticated(true)
            } else {
              setIsAuthenticated(false)
              navigate('/login')
            }
          } else {
            setIsAuthenticated(false)
            navigate('/login')
          }
        } catch (error) {
          console.error('Error checking user role:', error)
          setIsAuthenticated(false)
          navigate('/login')
        }
      } else {
        setIsAuthenticated(false)
        navigate('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="h-8 w-8 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// ========== LAZY LOADED COMPONENTS ==========

// Admin Components
const AdminLogin = Login

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Students = lazy(() => import('./pages/Students'))
const Courses = lazy(() => import('./pages/Courses'))
const Enrollments = lazy(() => import('./pages/Enrollments'))
const FinalYearProjects = lazy(() => import('./pages/FinalYearProjects'))
const Assignments = lazy(() => import('./pages/Assignments'))
const Payments = lazy(() => import('./pages/Payments'))
const Certificates = lazy(() => import('./pages/Certificates'))
const Messages = lazy(() => import('./pages/Messages'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Reports = lazy(() => import('./pages/Reports'))
const UsersRoles = lazy(() => import('./pages/UsersRoles'))
const WebsiteContent = lazy(() => import('./pages/WebsiteContent'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const ApprovePayments = lazy(() => import('./pages/ApprovePayments'))

// User Components
const UserDashboard = lazy(() => import('./pages/user/Dashboard'))
const UserMyCourses = lazy(() => import('./pages/user/My Courses'))
const UserEnrollments = lazy(() => import('./pages/user/Enrollments'))
const UserAssignments = lazy(() => import('./pages/user/Assignments'))
const UserFinalYearProjects = lazy(() => import('./pages/user/Final Year Projects'))
const UserCertificates = lazy(() => import('./pages/user/Certificates'))
const UserMessages = lazy(() => import('./pages/user/Messages'))
const UserPayments = lazy(() => import('./pages/user/Payments'))
const UserProfile = lazy(() => import('./pages/user/Profile'))
const UserAnnouncements = lazy(() => import('./pages/user/Announcements'))
const UserCoursesList = lazy(() => import('./pages/user/courses_list'))
const PaymentSubmit = lazy(() => import('./pages/user/PaymentSubmit'))

// ========== UTILITY COMPONENTS ==========
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const AdminPageFallback = () => (
  <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
    <div className="h-8 w-8 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
  </div>
)

const UserPageFallback = () => (
  <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
    <div className="h-8 w-8 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
  </div>
)

// ========== MAIN APP COMPONENT ==========
export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isUserRoute = location.pathname.startsWith('/user')

  return (
    <>
    <VersionChecker />
      {/* Public Layout Elements */}
      {!isAdminRoute && !isUserRoute && <ScrollProgress />}
      <ScrollToTop />
      {!isAdminRoute && !isUserRoute && <Navbar />}

      <main>
        <Routes>
          {/* ============================================
              PUBLIC ROUTES (No Auth Required)
              ============================================ */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:slug" element={<CourseDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/services" element={<Services />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/category/:categorySlug" element={<Blog />} />
          <Route path="/blog/post/:postSlug" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* ============================================
              AUTH ROUTES
              ============================================ */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ============================================
              ADMIN DASHBOARD - PROTECTED ROUTES
              ============================================ */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <DashboardLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={
              <Suspense fallback={<AdminPageFallback />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="dashboard" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="students" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Students />
              </Suspense>
            } />
            <Route path="users-roles" element={
              <Suspense fallback={<AdminPageFallback />}>
                <UsersRoles />
              </Suspense>
            } />
            <Route path="courses" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Courses />
              </Suspense>
            } />
            <Route path="enrollments" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Enrollments />
              </Suspense>
            } />
            <Route path="final-year-projects" element={
              <Suspense fallback={<AdminPageFallback />}>
                <FinalYearProjects />
              </Suspense>
            } />
            <Route path="assignments" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Assignments />
              </Suspense>
            } />
            <Route path="payments" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Payments />
              </Suspense>
            } />
            <Route path="approve-payments" element={
              <Suspense fallback={<AdminPageFallback />}>
                <ApprovePayments />
              </Suspense>
            } />
            <Route path="certificates" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Certificates />
              </Suspense>
            } />
            <Route path="messages" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Messages />
              </Suspense>
            } />
            <Route path="analytics" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Analytics />
              </Suspense>
            } />
            <Route path="reports" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Reports />
              </Suspense>
            } />
            <Route path="website-content" element={
              <Suspense fallback={<AdminPageFallback />}>
                <WebsiteContent />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Settings />
              </Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<AdminPageFallback />}>
                <Profile />
              </Suspense>
            } />
          </Route>

          {/* ============================================
              USER DASHBOARD - PROTECTED ROUTES
              ============================================ */}
          <Route
            path="/user"
            element={
              <UserProtectedRoute>
                <UserLayout />
              </UserProtectedRoute>
            }
          >
            {/* User Dashboard */}
            <Route index element={
              <Suspense fallback={<UserPageFallback />}>
                <UserDashboard />
              </Suspense>
            } />
            <Route path="dashboard" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserDashboard />
              </Suspense>
            } />
            
            {/* Courses Routes */}
            <Route path="courses" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserCoursesList />
              </Suspense>
            } />
            <Route path="my-courses" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserMyCourses />
              </Suspense>
            } />
            
            {/* Payment Routes */}
            <Route path="payment/:courseId" element={
              <Suspense fallback={<UserPageFallback />}>
                <PaymentSubmit />
              </Suspense>
            } />
            <Route path="payments" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserPayments />
              </Suspense>
            } />
            
            {/* Other User Routes */}
            <Route path="enrollments" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserEnrollments />
              </Suspense>
            } />
            <Route path="assignments" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserAssignments />
              </Suspense>
            } />
            <Route path="final-year-projects" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserFinalYearProjects />
              </Suspense>
            } />
            <Route path="certificates" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserCertificates />
              </Suspense>
            } />
            <Route path="messages" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserMessages />
              </Suspense>
            } />
            <Route path="announcements" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserAnnouncements />
              </Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<UserPageFallback />}>
                <UserProfile />
              </Suspense>
            } />
          </Route>

          {/* ============================================
              404 NOT FOUND
              ============================================ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer - Only show on public routes */}
      {!isAdminRoute && !isUserRoute && <Footer />}
    </>
  )
}