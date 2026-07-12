// src/pages/Settings.tsx
// Reads/writes a single document: settings/institute
// NOTE: SMTP and payment gateway secrets are sensitive. Restrict this
// document with Firestore security rules to admin-only reads/writes, and
// for production consider keeping the actual secret *values* in a backend
// (Cloud Function env vars) rather than in Firestore at all — this page can
// still manage everything except the raw secret strings if you'd prefer.
import React, { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { Building2, Share2, Mail, CreditCard, Save, Check } from "lucide-react";

import { db } from "../firebase/firebase";

interface InstituteSettings {
  instituteName: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  social: { facebook: string; instagram: string; twitter: string; linkedin: string };
  smtp: { host: string; port: string; username: string; password: string };
  paymentGateway: { provider: string; keyId: string; keySecret: string };
}

const defaults: InstituteSettings = {
  instituteName: "",
  logoUrl: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  social: { facebook: "", instagram: "", twitter: "", linkedin: "" },
  smtp: { host: "", port: "", username: "", password: "" },
  paymentGateway: { provider: "Razorpay", keyId: "", keySecret: "" },
};

const SECTIONS = [
  { id: "general", label: "Institute Details", icon: Building2 },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "smtp", label: "SMTP Configuration", icon: Mail },
  { id: "payment", label: "Payment Gateway", icon: CreditCard },
] as const;

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<InstituteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]["id"]>("general");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "institute"), (snap) => {
      if (snap.exists()) {
        setSettings({ ...defaults, ...(snap.data() as InstituteSettings) });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const set = (patch: Partial<InstituteSettings>) => setSettings((s) => ({ ...s, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "institute"), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30";
  const labelClass = "text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block";

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-6" />
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure institute-wide preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 sm:gap-6">
        {/* Section tabs */}
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible rounded-2xl lg:rounded-none border lg:border-none border-slate-200 dark:border-slate-700/60 p-2 lg:p-0 bg-white dark:bg-[#1E293B] lg:bg-transparent">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeSection === s.id
                  ? "bg-[#6C63FF] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-4 sm:p-6">
          {activeSection === "general" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Institute Name</label>
                <input
                  value={settings.instituteName}
                  onChange={(e) => set({ instituteName: e.target.value })}
                  className={inputClass}
                  placeholder="Xeviqo Training Institute"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Logo URL</label>
                <input
                  value={settings.logoUrl}
                  onChange={(e) => set({ logoUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => set({ address: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={settings.phone} onChange={(e) => set({ phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input value={settings.email} onChange={(e) => set({ email: e.target.value })} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Website</label>
                <input
                  value={settings.website}
                  onChange={(e) => set({ website: e.target.value })}
                  className={inputClass}
                  placeholder="https://xeviqo.in"
                />
              </div>
            </div>
          )}

          {activeSection === "social" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["facebook", "instagram", "twitter", "linkedin"] as const).map((key) => (
                <div key={key}>
                  <label className={`${labelClass} capitalize`}>{key}</label>
                  <input
                    value={settings.social[key]}
                    onChange={(e) => set({ social: { ...settings.social, [key]: e.target.value } })}
                    className={inputClass}
                    placeholder={`https://${key}.com/xeviqo`}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === "smtp" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>SMTP Host</label>
                <input
                  value={settings.smtp.host}
                  onChange={(e) => set({ smtp: { ...settings.smtp, host: e.target.value } })}
                  className={inputClass}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className={labelClass}>Port</label>
                <input
                  value={settings.smtp.port}
                  onChange={(e) => set({ smtp: { ...settings.smtp, port: e.target.value } })}
                  className={inputClass}
                  placeholder="587"
                />
              </div>
              <div>
                <label className={labelClass}>Username</label>
                <input
                  value={settings.smtp.username}
                  onChange={(e) => set({ smtp: { ...settings.smtp, username: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={settings.smtp.password}
                  onChange={(e) => set({ smtp: { ...settings.smtp, password: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <p className="sm:col-span-2 text-xs text-amber-600 dark:text-amber-400">
                For production, send actual emails via a Cloud Function that reads these values server-side —
                never call SMTP directly from the browser.
              </p>
            </div>
          )}

          {activeSection === "payment" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Provider</label>
                <select
                  value={settings.paymentGateway.provider}
                  onChange={(e) => set({ paymentGateway: { ...settings.paymentGateway, provider: e.target.value } })}
                  className={inputClass}
                >
                  <option>Razorpay</option>
                  <option>Stripe</option>
                  <option>PayU</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Key ID</label>
                <input
                  value={settings.paymentGateway.keyId}
                  onChange={(e) => set({ paymentGateway: { ...settings.paymentGateway, keyId: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Key Secret</label>
                <input
                  type="password"
                  value={settings.paymentGateway.keySecret}
                  onChange={(e) => set({ paymentGateway: { ...settings.paymentGateway, keySecret: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <p className="sm:col-span-2 text-xs text-amber-600 dark:text-amber-400">
                Key secrets should ultimately live server-side (Cloud Function config), not in a client-readable
                document, once you move past prototyping.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
