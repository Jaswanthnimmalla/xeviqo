// src/pages/WebsiteContent.tsx
// Backs the public marketing site with three real Firestore locations:
//   websiteContent/home  — hero + announcement banner (single doc)
//   testimonials         — collection, one doc per testimonial
//   faqs                 — collection, one doc per question
import React, { useEffect, useMemo, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { Layout, MessageSquareQuote, HelpCircle, Plus, Pencil, Trash2, Save, Check, X } from "lucide-react";

import { db } from "../firebase/firebase";
import { useCollection } from "../lib/useCollection";
import { EmptyState } from "../components/ui/TableHelpers";
import StatusBadge from "../components/ui/StatusBadge";
import type { WebsiteHomeContent, Testimonial, FAQ } from "../types";

const TABS = [
  { id: "hero", label: "Hero & Banner", icon: Layout },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
] as const;

const defaultHome: WebsiteHomeContent = {
  heroTitle: "",
  heroSubtitle: "",
  heroImageUrl: "",
  announcementText: "",
  announcementActive: false,
};

const WebsiteContent: React.FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hero");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Website Content</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage what visitors see on the public Xeviqo website.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/60 p-1.5 bg-white dark:bg-[#1E293B] w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? "bg-[#6C63FF] text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroTab />}
      {tab === "testimonials" && <TestimonialsTab />}
      {tab === "faqs" && <FAQsTab />}
    </div>
  );
};

const HeroTab: React.FC = () => {
  const [content, setContent] = useState<WebsiteHomeContent>(defaultHome);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "websiteContent", "home"), (snap) => {
      if (snap.exists()) setContent({ ...defaultHome, ...(snap.data() as WebsiteHomeContent) });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30";
  const labelClass = "text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block";

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "websiteContent", "home"), { ...content, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-4 sm:p-6 space-y-5 max-w-2xl">
      <div>
        <label className={labelClass}>Hero Title</label>
        <input
          value={content.heroTitle}
          onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
          className={inputClass}
          placeholder="Launch your tech career with Xeviqo"
        />
      </div>
      <div>
        <label className={labelClass}>Hero Subtitle</label>
        <textarea
          value={content.heroSubtitle}
          onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
          rows={2}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Hero Image URL</label>
        <input
          value={content.heroImageUrl}
          onChange={(e) => setContent({ ...content, heroImageUrl: e.target.value })}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Announcement Banner</label>
          <button
            onClick={() => setContent({ ...content, announcementActive: !content.announcementActive })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              content.announcementActive ? "bg-[#6C63FF]" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                content.announcementActive ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <input
          value={content.announcementText}
          onChange={(e) => setContent({ ...content, announcementText: e.target.value })}
          className={inputClass}
          placeholder="New batch starting 1st August — enroll now!"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

const TestimonialsTab: React.FC = () => {
  const { data: testimonials, loading } = useCollection<Testimonial>("testimonials");
  const [modal, setModal] = useState<Testimonial | "new" | null>(null);

  const sorted = useMemo(
    () => [...testimonials].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
    [testimonials]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await deleteDoc(doc(db, "testimonials", id));
  };

  const togglePublish = async (t: Testimonial) => {
    await updateDoc(doc(db, "testimonials", t.id), { published: !t.published });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModal("new")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B]">
          <EmptyState title="No testimonials yet" subtitle="Add your first student testimonial." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => togglePublish(t)}>
                  <StatusBadge label={t.published ? "Published" : "Draft"} />
                </button>
                <div className="flex gap-1">
                  <button onClick={() => setModal(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{t.message}"</p>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <TestimonialModal testimonial={modal === "new" ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
};

const TestimonialModal: React.FC<{ testimonial: Testimonial | null; onClose: () => void }> = ({
  testimonial,
  onClose,
}) => {
  const [name, setName] = useState(testimonial?.name || "");
  const [role, setRole] = useState(testimonial?.role || "");
  const [message, setMessage] = useState(testimonial?.message || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (testimonial) {
        await updateDoc(doc(db, "testimonials", testimonial.id), { name, role, message });
      } else {
        await addDoc(collection(db, "testimonials"), {
          name,
          role,
          message,
          published: false,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            {testimonial ? "Edit Testimonial" : "Add Testimonial"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student name"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role / Batch (e.g. Java Full Stack, 2026)"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Testimonial message"
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name || !message}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FAQsTab: React.FC = () => {
  const { data: faqs, loading } = useCollection<FAQ>("faqs");
  const [modal, setModal] = useState<FAQ | "new" | null>(null);

  const sorted = useMemo(() => [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0)), [faqs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await deleteDoc(doc(db, "faqs", id));
  };

  const togglePublish = async (f: FAQ) => {
    await updateDoc(doc(db, "faqs", f.id), { published: !f.published });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModal("new")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] divide-y divide-slate-100 dark:divide-slate-700/40">
        {loading ? (
          <div className="p-6">
            <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState title="No FAQs yet" subtitle="Add common questions students ask." />
        ) : (
          sorted.map((f) => (
            <div key={f.id} className="p-4 sm:p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{f.question}</p>
                  <button onClick={() => togglePublish(f)}>
                    <StatusBadge label={f.published ? "Published" : "Draft"} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setModal(f)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && <FAQModal faq={modal === "new" ? null : modal} nextOrder={faqs.length} onClose={() => setModal(null)} />}
    </div>
  );
};

const FAQModal: React.FC<{ faq: FAQ | null; nextOrder: number; onClose: () => void }> = ({
  faq,
  nextOrder,
  onClose,
}) => {
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (faq) {
        await updateDoc(doc(db, "faqs", faq.id), { question, answer });
      } else {
        await addDoc(collection(db, "faqs"), {
          question,
          answer,
          order: nextOrder,
          published: false,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{faq ? "Edit FAQ" : "Add FAQ"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            rows={4}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !question || !answer}
            className="rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteContent;
