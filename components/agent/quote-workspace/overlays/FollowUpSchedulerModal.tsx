"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Bell, Check, CalendarDays, MessageSquare, Mail, Phone } from "lucide-react";

interface FollowUpSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId?: string | null;
  clientName?: string;
}

const QUICK_OPTIONS = [
  { label: "Tomorrow", days: 1, icon: "☀️" },
  { label: "In 3 days", days: 3, icon: "📅" },
  { label: "In 1 week", days: 7, icon: "🗓️" },
  { label: "In 2 weeks", days: 14, icon: "⏰" },
];

const CHANNELS = [
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone call", icon: Phone },
  { id: "sms", label: "Text/SMS", icon: MessageSquare },
];

export default function FollowUpSchedulerModal({ isOpen, onClose, quoteId, clientName }: FollowUpSchedulerModalProps) {
  const [selectedDays, setSelectedDays] = useState<number | null>(3);
  const [channel, setChannel] = useState("email");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const getFollowUpDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const handleSave = () => {
    if (!selectedDays) return;

    const followUp = {
      quoteId,
      clientName,
      followUpDate: getFollowUpDate(selectedDays),
      daysFromNow: selectedDays,
      channel,
      note,
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for now (production: persist to DB)
    const existing = JSON.parse(localStorage.getItem("agent-followups") || "[]");
    existing.push(followUp);
    localStorage.setItem("agent-followups", JSON.stringify(existing));

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[69]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 bottom-16 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[420px] bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Schedule Follow-Up</h3>
                  {clientName && <p className="text-[11px] text-gray-500">for {clientName}</p>}
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {saved ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Follow-up scheduled!</p>
                <p className="text-xs text-gray-500">
                  Reminder set for {selectedDays ? getFollowUpDate(selectedDays) : "—"}
                </p>
              </motion.div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                {/* When */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />When to follow up
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_OPTIONS.map(({ label, days, icon }) => (
                      <button
                        key={days}
                        onClick={() => setSelectedDays(days)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          selectedDays === days
                            ? "border-amber-400 bg-amber-50 text-amber-800"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{icon}</span>
                        <div className="text-left">
                          <p className="font-semibold text-xs">{label}</p>
                          <p className="text-[10px] text-gray-400">{getFollowUpDate(days)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* How */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />How to reach out
                  </p>
                  <div className="flex gap-2">
                    {CHANNELS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setChannel(id)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                          channel === id
                            ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Note (optional)</p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Check if they have questions about pricing..."
                    rows={2}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                  />
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={!selectedDays}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-40"
                >
                  Set Reminder for {selectedDays ? getFollowUpDate(selectedDays) : "—"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
