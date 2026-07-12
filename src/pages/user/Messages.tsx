// src/pages/user/Messages.tsx
// New collections: `chatThreads` (one per conversation, studentId-scoped) and
// `chatThreads/{id}/messages` subcollection — separate from the admin
// contact-form `messages` collection, since this is two-way chat.
import React, { useEffect, useMemo, useState } from "react";
import { where, collection, addDoc, doc, updateDoc, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { Search, Send, ArrowLeft, Paperclip } from "lucide-react";

import { db } from "../../firebase/firebase";
import { useCollection } from "../../lib/useCollection";
import { useCurrentStudent } from "../../lib/useCurrentStudent";
import { timeAgo, formatDate } from "../../lib/format";
import { EmptyState } from "../../components/ui/TableHelpers";
import type { ChatThread, ChatMessage } from "../../types";

const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div
    className={`rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${className}`}
  >
    {children}
  </div>
);

const MessagesPage: React.FC = () => {
  const { uid, student } = useCurrentStudent();
  const { data: threads, loading } = useCollection<ChatThread>("chatThreads", uid ? [where("studentId", "==", uid)] : []);

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const sorted = useMemo(
    () => [...threads].sort((a, b) => (b.lastMessageAt?.toMillis?.() ?? 0) - (a.lastMessageAt?.toMillis?.() ?? 0)),
    [threads]
  );
  const filtered = useMemo(
    () => sorted.filter((t) => !search || t.participantName.toLowerCase().includes(search.toLowerCase())),
    [sorted, search]
  );

  const active = threads.find((t) => t.id === activeId) || filtered[0] || null;

  useEffect(() => {
    if (!active) {
      setMessages([]);
      return;
    }
    const q = query(collection(db, "chatThreads", active.id, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ ...(d.data() as ChatMessage), id: d.id })));
    });
    return () => unsub();
  }, [active?.id]);

  const openThread = (t: ChatThread) => {
    setActiveId(t.id);
    setShowMobileChat(true);
    if (t.unreadCount) updateDoc(doc(db, "chatThreads", t.id), { unreadCount: 0 });
  };

  const handleSend = async () => {
    if (!active || !text.trim() || !uid) return;
    setSending(true);
    try {
      await addDoc(collection(db, "chatThreads", active.id, "messages"), {
        senderId: uid,
        senderName: student?.name || "You",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "chatThreads", active.id), {
        lastMessage: text.trim(),
        lastMessageAt: Timestamp.now(),
      });
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Connect with instructors, support team and your peers.</p>
      </div>

      <GlassCard className="overflow-hidden border-2 border-slate-300/80 dark:border-slate-600/80">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[520px]">
          {/* Left Panel - Thread List */}
          <div className={`border-r-2 border-slate-200 dark:border-slate-700 flex flex-col ${showMobileChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-white/5 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[560px]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse border-2 border-slate-200 dark:border-slate-700" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState title="No conversations yet" subtitle="Messages from instructors and support will appear here." />
              ) : (
                filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openThread(t)}
                    className={`w-full text-left px-4 py-3 border-b-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                      active?.id === t.id ? "bg-[#6C63FF]/5 dark:bg-[#6C63FF]/10 border-l-4 border-l-[#6C63FF]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center text-sm font-semibold text-[#6C63FF] dark:text-[#8B5CF6] shrink-0 border-2 border-[#6C63FF]/20">
                        {t.participantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{t.participantName}</p>
                          <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(t.lastMessageAt)}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.lastMessage}</p>
                      </div>
                      {!!t.unreadCount && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-[#6C63FF] text-white text-[10px] flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700">
                          {t.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Chat Area */}
          <div className={`flex flex-col ${showMobileChat ? "flex" : "hidden md:flex"}`}>
            {!active ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 border-2 border-slate-200 dark:border-slate-600">
                    <Send className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Select a conversation</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Choose a conversation from the list to start chatting.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <button onClick={() => setShowMobileChat(false)} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#8B5CF6]/20 flex items-center justify-center text-sm font-semibold text-[#6C63FF] dark:text-[#8B5CF6] border-2 border-[#6C63FF]/20">
                    {active.participantName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{active.participantName}</p>
                    <p className="text-xs text-slate-400 capitalize">{active.participantRole}</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-white/5">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-2 border-2 border-slate-200 dark:border-slate-600">
                          <Send className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Say hello! 👋</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = m.senderId === uid;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              mine
                                ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white rounded-br-sm border-2 border-white/20"
                                : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-bl-sm border-2 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {m.text}
                            <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                              {formatDate(m.createdAt, true)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t-2 border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-white/50 dark:bg-white/5">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-all">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all border-2 border-white/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default MessagesPage;