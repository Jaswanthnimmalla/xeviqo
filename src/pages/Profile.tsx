// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { Camera, Save, Check, ShieldCheck, KeyRound } from "lucide-react";

import { auth, db } from "../firebase/firebase"; // ✅ Fixed import path
import { useCurrentAdmin } from "../lib/useCurrentAdmin";

const Profile: React.FC = () => {
  const admin = useCurrentAdmin();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setPhone(admin.phone || "");
      setProfileImage(admin.profileImage || "");
      setTwoFactorEnabled((admin as any).twoFactorEnabled || false);
    }
  }, [admin]);

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30";
  const labelClass = "text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block";

  const handleSaveProfile = async () => {
    if (!admin) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", admin.id), {
        name,
        phone,
        profileImage,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMessage(null);
    if (!auth.currentUser?.email) return;
    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPwMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwMessage({ type: "error", text: err.message?.replace("Firebase: ", "") || "Failed to update password." });
    } finally {
      setPwSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!admin) return;
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    await updateDoc(doc(db, "users", admin.id), { twoFactorEnabled: next, updatedAt: serverTimestamp() });
  };

  if (!admin) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="h-6 sm:h-8 w-32 sm:w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-4 sm:mb-6" />
        <div className="h-48 sm:h-56 md:h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage your admin account details.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6">
        {/* Profile Avatar & Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative self-start">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] dark:text-[#7C6BFF] flex items-center justify-center text-lg sm:text-xl font-bold overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                name?.charAt(0).toUpperCase() || "A"
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#6C63FF] flex items-center justify-center text-white border-2 border-white dark:border-[#1E293B]">
              <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{admin.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className={labelClass}>Email (read-only)</label>
            <input 
              value={admin.email} 
              disabled 
              className={`${inputClass} opacity-60 cursor-not-allowed`} 
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className={inputClass}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className={labelClass}>Profile Image URL</label>
            <input 
              value={profileImage} 
              onChange={(e) => setProfileImage(e.target.value)} 
              className={inputClass}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4 sm:mt-5">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : saved ? "Saved" : "Update Profile"}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <KeyRound className="h-4 w-4 text-[#6C63FF]" />
          <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">Change Password</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter new password"
            />
          </div>
        </div>
        
        {pwMessage && (
          <p className={`text-[10px] sm:text-xs mt-2 ${pwMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {pwMessage.text}
          </p>
        )}
        
        <div className="flex justify-end mt-3 sm:mt-4">
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPassword || !newPassword}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[#6C63FF] mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm sm:text-base text-slate-800 dark:text-slate-100">
              Two-Factor Authentication
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adds an extra verification step at login.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            {twoFactorEnabled ? "Enabled" : "Disabled"}
          </span>
          <button
            onClick={handleToggle2FA}
            className={`relative h-5 w-10 sm:h-6 sm:w-11 rounded-full transition-colors shrink-0 ${
              twoFactorEnabled ? "bg-[#6C63FF]" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white transition-transform ${
                twoFactorEnabled ? "translate-x-5 sm:translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;