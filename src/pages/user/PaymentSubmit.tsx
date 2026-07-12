// src/pages/user/PaymentSubmit.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, CreditCard, QrCode, Download, Copy, 
  CheckCircle, AlertCircle, Upload, X, Loader2, Info, ChevronRight,
  Shield, Lock, Calendar, User, Clock, DollarSign, Cloud
} from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { formatCurrency } from "../../lib/format";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { auth } from "../../firebase/firebase";
import { uploadToCloudinary } from "../../lib/cloudinary"; // ✅ Import the same function
import type { Course } from "../../types";

interface QRCodeData {
  id: string;
  imageUrl: string;
  uploadedAt: any;
  isActive: boolean;
  description?: string;
}

const PaymentSubmit: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course as Course;

  const { data: qrCodes, loading: qrLoading } = useCollection<QRCodeData>("qrCodes");
  const [activeQR, setActiveQR] = useState<QRCodeData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const active = qrCodes?.find(q => q.isActive === true);
    setActiveQR(active || null);
  }, [qrCodes]);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const storedUserId = localStorage.getItem("userId") || "";
    
    setUserData(storedUserData);
    setUserId(storedUserId);

    if (!course && !courseId) {
      navigate("/user/courses");
    }
  }, [course, courseId, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please compress your image.");
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, GIF, WEBP)");
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedFile) {
      setError("Please upload a payment screenshot");
      return;
    }

    if (!transactionId) {
      setError("Please enter a transaction ID");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // ============================================
      // STEP 1: Upload to Cloudinary using the SAME function as admin
      // This will store in "qrcodes" folder (same as admin QR codes)
      // ============================================
      console.log("🚀 Starting payment submission...");
      console.log("📁 Uploading to same folder as admin QR codes (qrcodes)");
      
      const cloudinaryUrl = await uploadToCloudinary(selectedFile);
      console.log("✅ Uploaded to Cloudinary:", cloudinaryUrl);
      
      // ============================================
      // STEP 2: Get user data
      // ============================================
      let currentUserId = userId;
      let currentUserData = userData;

      if (!currentUserId) {
        const user = auth.currentUser;
        if (user) {
          currentUserId = user.uid;
          try {
            const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
            if (!userDoc.empty) {
              currentUserData = userDoc.docs[0].data();
            }
          } catch (err) {
            console.warn("Could not fetch user data:", err);
          }
        }
      }

      // ============================================
      // STEP 3: Generate receipt number
      // ============================================
      const timestamp = Date.now();
      const receiptNumber = `REC${String(timestamp).slice(-6)}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // ============================================
      // STEP 4: Save to Firebase Firestore
      // ============================================
      console.log("💾 Saving payment to Firestore...");
      
      const paymentData = {
        studentId: currentUserId || "unknown",
        userName: currentUserData?.name || currentUserData?.displayName || "Unknown User",
        userEmail: currentUserData?.email || "unknown@email.com",
        courseId: course?.id || courseId,
        courseName: course?.title || "Unknown Course",
        amount: course?.discountPrice || course?.price || 0,
        paymentMethod: "UPI",
        paymentStatus: "pending",
        transactionId: transactionId,
        receiptNumber: receiptNumber,
        // ✅ This URL is from the SAME Cloudinary folder as admin QR codes
        screenshotUrl: cloudinaryUrl,
        screenshotProvider: "cloudinary",
        screenshotFolder: "qrcodes",
        notes: notes || "Payment for course enrollment",
        paymentDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "payments"), paymentData);
      console.log("✅ Payment created with ID:", docRef.id);

      localStorage.setItem("lastPaymentId", docRef.id);
      setPaymentSuccess(true);
      
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit payment";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadQR = () => {
    if (activeQR?.imageUrl) {
      window.open(activeQR.imageUrl, '_blank');
    }
  };

  if (qrLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-[#6C63FF] animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700/60 p-6 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Course Not Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            The course you're trying to enroll in could not be found.
          </p>
          <button
            onClick={() => navigate("/user/courses")}
            className="px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white font-medium transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700/60 p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 mb-4 border-2 border-green-200 dark:border-green-500/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Submitted! 🎉</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Your payment screenshot has been uploaded to Cloudinary in the <strong>qrcodes</strong> folder 
            (same location as admin QR codes).
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 mb-6 border-2 border-slate-200 dark:border-slate-700/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Transaction ID</p>
            <p className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">{transactionId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/user/my-courses")}
              className="flex-1 px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white font-medium transition-colors"
            >
              View My Courses
            </button>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/user/payments")}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors font-medium"
            >
              View Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Courses</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Course Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700/60 overflow-hidden sticky top-4">
            <div className="h-32 bg-gradient-to-r from-[#6C63FF]/20 to-[#8B5CF6]/20 relative border-b-2 border-slate-200 dark:border-slate-700/60">
              <img 
                src={course.courseImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=6C63FF&color=fff&size=200`}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&background=6C63FF&color=fff&size=200`;
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {course.trainerName || "Instructor"}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Duration
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">Level</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400">Mode</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{course.mode}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </span>
                  <span className="text-lg font-bold text-[#6C63FF]">
                    {formatCurrency(course.discountPrice || course.price)}
                    {course.discountPrice && (
                      <span className="ml-2 text-sm text-slate-400 line-through">
                        {formatCurrency(course.price)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700/60 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-[#6C63FF]" />
              Complete Payment
            </h2>

            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-[#6C63FF]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  step === 1 ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Pay via QR</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700">
                <div className={`h-0.5 bg-[#6C63FF] transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-[#6C63FF]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  step === 2 ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Upload Proof</span>
              </div>
            </div>

            {/* Step 1: QR Code Display */}
            {step === 1 && (
              <div className="space-y-4">
                {activeQR ? (
                  <div className="text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 mb-4 border-2 border-slate-200 dark:border-slate-700/60">
                      <div className="relative inline-block">
                        <img 
                          src={activeQR.imageUrl} 
                          alt="Payment QR Code" 
                          className="w-64 h-64 object-contain mx-auto rounded-xl border-2 border-slate-200 dark:border-slate-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/256x256/6C63FF/FFFFFF?text=QR+Code';
                          }}
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white dark:border-slate-700">
                          Active
                        </div>
                      </div>
                      {activeQR.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                          {activeQR.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                      <button
                        onClick={handleDownloadQR}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm hover:border-[#6C63FF] dark:hover:border-[#8B5CF6]"
                      >
                        <Download className="h-4 w-4" />
                        Download QR
                      </button>
                      <button
                        onClick={() => {
                          if (activeQR?.imageUrl) {
                            navigator.clipboard.writeText(activeQR.imageUrl);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm hover:border-[#6C63FF] dark:hover:border-[#8B5CF6]"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 rounded-xl p-3 mb-4">
                      <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        Scan the QR code above using your UPI app and make the payment. 
                        After payment, proceed to step 2 to upload the transaction screenshot.
                      </p>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white font-medium transition-colors flex items-center justify-center gap-2 border-2 border-[#6C63FF]/30 hover:border-[#6C63FF]/50"
                    >
                      I've Made the Payment
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No QR Code Available</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Please contact support for payment instructions.
                    </p>
                    <button
                      onClick={() => navigate("/user/support")}
                      className="px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white font-medium transition-colors"
                    >
                      Contact Support
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Upload Proof */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from your UPI app"
                    className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  {!previewUrl ? (
                    <div 
                      className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-[#6C63FF] transition-colors cursor-pointer"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Cloud className="h-10 w-10 text-[#6C63FF] mx-auto mb-3" />
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Click to upload payment screenshot
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Supported: JPG, PNG, GIF (Max 5MB)
                      </p>
                      <p className="text-xs text-[#6C63FF] mt-2 font-medium">
                        📤 Uploads to <strong>qrcodes</strong> folder (same as admin QR codes)
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                      <img 
                        src={previewUrl} 
                        alt="Payment Screenshot" 
                        className="w-full max-h-64 object-contain"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors border-2 border-red-400/30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information about your payment..."
                    rows={2}
                    className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitPayment}
                    disabled={uploading || !selectedFile || !transactionId}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-[#6C63FF]/30 hover:border-[#6C63FF]/50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Uploading to qrcodes folder...
                      </>
                    ) : (
                      <>
                        <Cloud className="h-5 w-5" />
                        Submit Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSubmit;