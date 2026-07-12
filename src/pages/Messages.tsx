// src/pages/Messages.tsx
import React, { useMemo, useState } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Mail, MailOpen, Clock, CheckCircle2, Search, Trash2, Send, ArrowLeft } from "lucide-react";

import { db } from "../firebase/firebase"; // ✅ Fixed import path
import { useCollection } from "../lib/useCollection";
import { formatDate, timeAgo } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { EmptyState, TableSkeleton } from "../components/ui/TableHelpers";
import type { ContactMessage } from "../types";

const Messages: React.FC = () => {
  const { data: messages, loading } = useCollection<ContactMessage>("messages");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "in_progress" | "resolved">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const inProgressCount = messages.filter((m) => m.status === "in_progress").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

  const sorted = useMemo(
    () => [...messages].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
    [messages]
  );

  const filtered = useMemo(() => {
    return sorted.filter((m) => {
      const matchesSearch =
        !search ||
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()) ||
        m.message?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sorted, search, statusFilter]);

  const active = messages.find((m) => m.id === activeId) || filtered[0] || null;

  const openMessage = async (m: ContactMessage) => {
    setActiveId(m.id);
    setReplyText("");
    setShowMobileDetail(true);
    if (m.status === "unread") {
      await updateDoc(doc(db, "messages", m.id), { status: "in_progress", updatedAt: serverTimestamp() });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteDoc(doc(db, "messages", id));
    if (activeId === id) setActiveId(null);
  };

  const handleMarkInProgress = async (m: ContactMessage) => {
    await updateDoc(doc(db, "messages", m.id), { status: "in_progress", updatedAt: serverTimestamp() });
  };

  const handleSendReply = async () => {
    if (!active || !replyText.trim()) return;
    setSending(true);
    try {
      await updateDoc(doc(db, "messages", active.id), {
        replied: true,
        replyMessage: replyText.trim(),
        repliedAt: Timestamp.now(),
        status: "resolved",
        updatedAt: serverTimestamp(),
      });
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Dashboard &gt; Messages</p>
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Total" value={messages.length} icon={Mail} color="violet" loading={loading} />
        <StatCard label="Unread" value={unreadCount} icon={MailOpen} color="blue" loading={loading} />
        <StatCard label="In Progress" value={inProgressCount} icon={Clock} color="amber" loading={loading} />
        <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle2} color="green" loading={loading} />
      </div>

      {/* Messages Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-[500px]">
          {/* Message list - Left Panel */}
          <div
            className={`border-r border-slate-200 dark:border-slate-700/60 flex flex-col ${
              showMobileDetail ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Filters */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
              >
                <option value="all">All Types</option>
                <option value="unread">Unread</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px]">
              {loading ? (
                <TableSkeleton rows={5} />
              ) : filtered.length === 0 ? (
                <EmptyState title="No messages found" />
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => openMessage(m)}
                    className={`w-full text-left px-3 sm:px-4 py-3 border-b border-slate-100 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      active?.id === m.id ? "bg-[#6C63FF]/5 dark:bg-[#6C63FF]/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                        {m.name}
                      </p>
                      <span className="text-[10px] sm:text-xs text-slate-400 shrink-0">
                        {timeAgo(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 truncate mt-0.5">
                      {m.subject}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                      {m.message}
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge label={m.status === "in_progress" ? "In Progress" : m.status} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail pane - Right Panel */}
          <div className={`flex flex-col ${showMobileDetail ? "flex" : "hidden md:flex"}`}>
            {!active ? (
              <EmptyState title="Select a message" subtitle="Choose a message from the list to view details." />
            ) : (
              <>
                {/* Header */}
                <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <button
                      onClick={() => setShowMobileDetail(false)}
                      className="md:hidden p-1 -ml-1 text-slate-400 hover:text-slate-600"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {active.subject}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">
                        {active.name} • {active.email}
                        {active.phone ? ` • ${active.phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge label={active.status === "in_progress" ? "In Progress" : active.status} />
                    <button
                      onClick={() => handleDelete(active.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto space-y-4 max-h-[300px] sm:max-h-[400px]">
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {active.message}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    {formatDate(active.createdAt, true)}
                  </p>

                  {active.replied && active.replyMessage && (
                    <div className="rounded-xl bg-[#6C63FF]/5 dark:bg-[#6C63FF]/10 border border-[#6C63FF]/10 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs font-medium text-[#6C63FF] dark:text-[#7C6BFF] mb-1">
                        Admin Reply
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                        {active.replyMessage}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                        {formatDate(active.repliedAt, true)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reply Section */}
                <div className="p-3 sm:p-4 md:p-6 border-t border-slate-200 dark:border-slate-700/60">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                  />
                  <div className="flex flex-col xs:flex-row justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleMarkInProgress(active)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors order-2 xs:order-1"
                    >
                      Mark as In Progress
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b53e6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white disabled:opacity-50 transition-colors order-1 xs:order-2"
                    >
                      <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;