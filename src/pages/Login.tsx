// src/pages/Login.tsx
import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  serverTimestamp, 
  updateDoc,
  setDoc
} from "firebase/firestore";
import {
  Mail, Lock, Eye, EyeOff, User, Crown, ArrowRight, AlertCircle
} from "lucide-react";

import { auth, db } from "../firebase/firebase";

const loginImage = "/images/login_image.png";
const xeviqoLogo = "/images/xeviqo_login.png";

// Role Toggle
const RoleToggle = memo(({ role, setRole }: { role: string; setRole: (r: string) => void }) => (
  <div className="mb-6 flex w-full rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
    <button
      type="button"
      onClick={() => setRole("user")}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
        role === "user"
          ? "bg-white dark:bg-slate-700 text-[#6C63FF] shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      <User className="h-4 w-4" />
      User
    </button>
    <button
      type="button"
      onClick={() => setRole("admin")}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
        role === "admin"
          ? "bg-white dark:bg-slate-700 text-[#6C63FF] shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      <Crown className="h-4 w-4" />
      Admin
    </button>
  </div>
));

// Login Form Component
const LoginForm = memo(({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  googleLoading,
  error,
  handleLogin,
  handleGoogleLogin,
  handleForgotPassword,
  role,
  setRole
}: any) => (
  <>
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back!</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to continue to your account</p>
    </div>

    <form onSubmit={handleLogin} className="space-y-4">
      <RoleToggle role={role} setRole={setRole} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#6C63FF] transition-colors duration-300 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-[#6C63FF] hover:text-[#5b53e6] transition-colors duration-300 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#6C63FF] transition-colors duration-300 pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all duration-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v: boolean) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className={`flex items-center gap-2 p-3 rounded-xl border ${
          error.includes("not registered") || error.includes("Google")
            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600"
            : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
        }`}>
          <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
            error.includes("not registered") || error.includes("Google")
              ? "text-yellow-600 dark:text-yellow-500"
              : "text-red-500"
          }`} />
          <p className={`text-xs ${
            error.includes("not registered") || error.includes("Google")
              ? "text-yellow-700 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          }`}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || googleLoading}
        className="relative w-full rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#EC4899] hover:from-[#5b53e6] hover:to-[#db2f85] py-3 text-sm font-medium text-white disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6C63FF]/25 active:scale-[0.98] overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>
    </form>

    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white dark:bg-[#1E293B] px-3 text-slate-400 dark:text-slate-500">or continue with</span>
      </div>
    </div>

    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading || googleLoading}
      className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-[#6C63FF] dark:hover:border-[#8B5CF6] transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {googleLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-[#6C63FF]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Signing you in...
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" />
            <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  </>
));

// Main Component
const Login: React.FC = () => {
  const navigate = useNavigate();

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Separate loading flag for the Google flow so its own spinner/label can
  // show ("Signing you in...") the instant the popup returns — the user
  // gets immediate visual feedback instead of the button just sitting idle
  // while the Firestore reads below are still in flight.
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");

  // Guards onAuthStateChanged from racing with handleLogin / handleGoogleLogin.
  // Those two functions already own the full login flow (role check, status
  // check, Firestore doc creation, navigation) — onAuthStateChanged should
  // only kick in for a session that was already valid BEFORE this page
  // loaded (e.g. a page refresh), not for a sign-in that's actively being
  // processed by a click on this page.
  const manualLoginInProgressRef = useRef(false);

  // Set persistence and check auth state on mount
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("✅ Auth persistence set to LOCAL");
      })
      .catch((error) => {
        console.error("❌ Error setting persistence:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (manualLoginInProgressRef.current) {
        // handleLogin / handleGoogleLogin is already handling this
        // sign-in end-to-end. Don't interfere with it.
        return;
      }
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            await updateDoc(doc(db, "users", user.uid), {
              lastLogin: serverTimestamp()
            });
            
            const isAdmin = userData?.role === "admin";
            
            localStorage.setItem("userData", JSON.stringify(userData));
            localStorage.setItem("userRole", isAdmin ? "admin" : "user");
            localStorage.setItem("userId", user.uid);
            localStorage.setItem("userName", userData?.name || "User");
            
            if (isAdmin) {
              navigate("/admin/dashboard");
            } else {
              navigate("/user/dashboard");
            }
          } else {
            await signOut(auth);
            console.log("❌ User not found in Firestore");
          }
        } catch (err) {
          console.error("Error checking user session:", err);
          await signOut(auth);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ============================================================
  // 🔐 EMAIL/PASSWORD LOGIN
  // ============================================================
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    manualLoginInProgressRef.current = true;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Read both possible profile locations in parallel instead of
      // sequentially — halves the worst-case wait time.
      const [userSnap, adminSnap] = await Promise.all([
        getDoc(doc(db, "users", cred.user.uid)),
        getDoc(doc(db, "admins", cred.user.uid)),
      ]);

      let isAdmin = false;
      let userData: any = null;

      if (userSnap.exists()) {
        userData = userSnap.data();
      } else if (adminSnap.exists()) {
        userData = adminSnap.data();
        isAdmin = true;
      } else {
        await signOut(auth);
        setError("❌ User profile not found. Please contact support.");
        setLoading(false);
        return;
      }

      if (role === "admin" && !isAdmin) {
        await signOut(auth);
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }

      if (role === "user" && isAdmin) {
        await signOut(auth);
        setError("This account does not have user access. Please select Admin.");
        setLoading(false);
        return;
      }

      if (userData.status !== "active") {
        await signOut(auth);
        setError("Your account is not active. Please contact support.");
        setLoading(false);
        return;
      }

      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userRole", isAdmin ? "admin" : "user");
      localStorage.setItem("userId", cred.user.uid);
      localStorage.setItem("userName", userData.name || "User");

      // Navigate immediately — the lastLogin timestamp write below doesn't
      // need to finish before the user sees their dashboard.
      setLoading(false);

      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }

      // Fire-and-forget: update lastLogin in the background.
      updateDoc(doc(db, isAdmin ? "admins" : "users", cred.user.uid), {
        lastLogin: serverTimestamp()
      }).catch((e) => console.error("Background lastLogin update failed:", e));

    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "Login failed. Please try again.";
      
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "❌ No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = err.message?.replace("Firebase: ", "") || "Login failed. Please try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    } finally {
      manualLoginInProgressRef.current = false;
    }
  }, [email, password, navigate, role]);

  // ============================================================
  // 🔐 GOOGLE LOGIN
  // ------------------------------------------------------------
  // Logic (unchanged from before, only the ORDER/PARALLELISM of the
  // Firestore calls changed — see inline notes below):
  //
  // 1. Admin manually adds a Gmail address in Firebase Authentication
  //    (Authentication tab -> Add user). That creates a real Auth
  //    record with that email, with NO Firestore doc yet.
  // 2. The user then clicks "Continue with Google" here and signs in
  //    with that SAME Gmail address.
  // 3. We must know whether the Auth record Google just signed into
  //    is the pre-existing one (admin-added) or a brand-new one that
  //    Firebase silently created because the email was never added.
  //
  //    Reliable check: compare user.metadata.creationTime with
  //    user.metadata.lastSignInTime. Firebase sets these to the exact
  //    same timestamp ONLY when the Auth record was created during
  //    THIS sign-in call.
  //
  // 4. If the record is brand new -> reject, delete it, sign out.
  // 5. If the record pre-existed -> allow login, and create the
  //    Firestore "users" doc for it now if it doesn't exist yet.
  //
  // PERFORMANCE CHANGE: previously the users/admins lookups ran
  // sequentially (await users, THEN await admins if that missed), and
  // the lastLogin write was awaited BEFORE navigating. That stacked up
  // to 3 sequential Firestore round-trips (400-900ms combined) after
  // the popup closed, which is exactly the "too late responding" delay
  // being reported. Now: users+admins are read in parallel, and
  // lastLogin is written in the background after navigation fires.
  // ============================================================
  const handleGoogleLogin = useCallback(async () => {
    setError("");
    setGoogleLoading(true);
    manualLoginInProgressRef.current = true;

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Step 1: Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email;

      if (!userEmail) {
        await signOut(auth);
        setError("Could not retrieve email from Google account.");
        setGoogleLoading(false);
        return;
      }

      // Step 2: Was this Auth record pre-registered by the admin,
      // or did Firebase just create it during this very sign-in?
      const { creationTime, lastSignInTime } = user.metadata;
      const isBrandNewAuthRecord = creationTime === lastSignInTime;

      console.log("🔍 Google email:", userEmail, "| new record?", isBrandNewAuthRecord);

      if (isBrandNewAuthRecord) {
        console.log("❌ Gmail was NOT pre-added by admin. Rejecting & cleaning up...");
        try {
          await user.delete();
          console.log("✅ Newly created Auth record deleted");
        } catch (deleteError) {
          console.error("❌ Failed to delete unregistered Google user:", deleteError);
        }
        await signOut(auth);
        setError("❌ This Google account is not registered. Please contact admin to add your email.");
        setGoogleLoading(false);
        return;
      }

      console.log("✅ Gmail IS pre-registered in Firebase Authentication. Proceeding...");

      // Step 3: Check "users" and "admins" in PARALLEL instead of
      // sequentially. Reading both at once costs the same latency as a
      // single read, instead of doubling it in the worst case.
      const [userSnap, adminSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "admins", user.uid)),
      ]);

      let isAdmin = false;
      let userData: any = null;

      if (userSnap.exists()) {
        userData = userSnap.data();
        console.log("✅ User found in Firestore users collection");
      } else if (adminSnap.exists()) {
        userData = adminSnap.data();
        isAdmin = true;
        console.log("✅ User found in Firestore admins collection");
      } else {
        // First-ever login for this pre-registered Gmail -> create the doc.
        // This is the one write that DOES need to be awaited, since
        // userData doesn't exist without it.
        console.log("📝 Creating user document in Firestore...");

        const newUserData = {
          uid: user.uid,
          name: user.displayName || userEmail.split('@')[0],
          email: userEmail,
          role: "user",
          status: "active",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          photoURL: user.photoURL || null,
          provider: "google"
        };

        try {
          await setDoc(doc(db, "users", user.uid), newUserData);
          userData = newUserData;
          isAdmin = false;
          console.log("✅ User document created in Firestore successfully!");
        } catch (firestoreError) {
          console.error("❌ Failed to create user document:", firestoreError);
          await signOut(auth);
          setError("Failed to create user profile. Please contact support.");
          setGoogleLoading(false);
          return;
        }
      }

      // Step 4: Role validation
      if (role === "admin" && !isAdmin) {
        await signOut(auth);
        setError("This account does not have admin access.");
        setGoogleLoading(false);
        return;
      }

      if (role === "user" && isAdmin) {
        await signOut(auth);
        setError("This account does not have user access. Please select Admin.");
        setGoogleLoading(false);
        return;
      }

      // Step 5: Check account status
      if (userData.status !== "active") {
        await signOut(auth);
        setError("Your account is not active. Please contact support.");
        setGoogleLoading(false);
        return;
      }

      // Step 6: Store user data in localStorage — cheap and synchronous,
      // do it right away so the next page has what it needs immediately.
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userRole", isAdmin ? "admin" : "user");
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("userName", userData.name || "User");

      // Step 7: Navigate NOW. Nothing past this point needs to block the
      // user from seeing their dashboard — this is the key change that
      // removes the "too late responding" feeling.
      setGoogleLoading(false);
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }

      // Step 8: Update lastLogin in the background (fire-and-forget).
      // Errors here are logged only — they must never block or reverse
      // a navigation that's already happened.
      updateDoc(doc(db, isAdmin ? "admins" : "users", user.uid), {
        lastLogin: serverTimestamp()
      }).catch((e) => console.error("Background lastLogin update failed:", e));

    } catch (err: any) {
      console.error("Google login error:", err);
      let errorMessage = "Google login failed. Please try again.";
      
      switch (err.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Login cancelled. Please try again.";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage = "An account already exists with the same email address but different sign-in credentials.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = err.message || "Google login failed. Please try again.";
      }
      
      setError(errorMessage);
      setGoogleLoading(false);
    } finally {
      manualLoginInProgressRef.current = false;
    }
  }, [navigate, role]);

  // Handle Forgot Password
  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setError("✅ Password reset email sent! Please check your inbox.");
      setTimeout(() => {
        setError("");
      }, 5000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      let errorMessage = "Failed to send reset email. ";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "❌ No account found with this email.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage += err.message || "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F6FB] dark:bg-slate-900 px-3 sm:px-4 py-4 sm:py-8 pt-16 sm:pt-20 lg:pt-8">
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-300/60 dark:shadow-black/50 bg-white dark:bg-[#1E293B]">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0B0518] to-[#1a0a2e] p-8 xl:p-10 overflow-hidden relative">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full border border-[#6C63FF]/20" />
          <div className="pointer-events-none absolute -top-24 -right-24 h-[300px] w-[300px] rounded-full border border-[#8B5CF6]/20" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#6C63FF]/15 blur-[100px]" />

          <div className="relative z-10 flex items-center gap-3">
            <img 
              src={xeviqoLogo} 
              alt="Xeviqo" 
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 object-contain"
            />
          </div>

          <div className="relative z-10 mt-6 xl:mt-8">
            <h2 className="text-2xl xl:text-3xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent">
                Learn Today.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#6C63FF] to-[#38BDF8] bg-clip-text text-transparent">
                Build Tomorrow.
              </span>
            </h2>
            <p className="mt-2 xl:mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
              Professional training in Python, Java and innovative project solutions.
            </p>
          </div>

          <div className="relative z-10 mt-4 xl:mt-6 flex items-end justify-center">
            <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] flex items-center justify-center">
              <img
                src={loginImage}
                alt="Student coding on a laptop"
                className="w-full h-auto object-contain"
                style={{ 
                  background: 'transparent',
                  mixBlendMode: 'normal'
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative flex items-center justify-center bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 min-h-[500px] sm:min-h-[550px] lg:min-h-0">
          <div className="w-full max-w-sm">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              googleLoading={googleLoading}
              error={error}
              handleLogin={handleLogin}
              handleGoogleLogin={handleGoogleLogin}
              handleForgotPassword={handleForgotPassword}
              role={role}
              setRole={setRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;