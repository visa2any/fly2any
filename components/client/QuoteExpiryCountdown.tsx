"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface QuoteExpiryCountdownProps {
  expiresAt: string;
  status: string;
  onExpired?: () => void;
  compact?: boolean;
  brandColor?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function QuoteExpiryCountdown({
  expiresAt,
  status,
  onExpired,
  compact = false,
  brandColor = "#E74035",
}: QuoteExpiryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isAccepted, setIsAccepted] = useState(status === "ACCEPTED" || status === "CONVERTED");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        onExpired?.();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  useEffect(() => {
    setIsAccepted(status === "ACCEPTED" || status === "CONVERTED");
  }, [status]);

  // Already accepted - no countdown needed
  if (isAccepted) {
    return (
      <div className={`flex items-center gap-2 ${compact ? "text-sm" : ""}`}>
        <CheckCircle2 className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-green-500`} />
        <span className="text-green-600 font-medium">Quote Accepted</span>
      </div>
    );
  }

  // Expired
  if (isExpired || !timeLeft) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 ${compact ? "px-3 py-1.5" : "px-4 py-2"} bg-red-50 border border-red-200 rounded-xl`}
      >
        <AlertTriangle className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-red-500`} />
        <span className={`${compact ? "text-sm" : ""} text-red-600 font-medium`}>
          Quote Expired
        </span>
      </motion.div>
    );
  }

  // Urgency levels
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 12;
  const isWarning = timeLeft.days === 0 || (timeLeft.days === 1 && timeLeft.hours < 12);

  // Compact version
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isUrgent
            ? "bg-red-100 text-red-700"
            : isWarning
            ? "bg-orange-100 text-orange-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        {timeLeft.days > 0 ? (
          <span>{timeLeft.days}d {timeLeft.hours}h left</span>
        ) : (
          <span>{timeLeft.hours}h {timeLeft.minutes}m left</span>
        )}
      </motion.div>
    );
  }

  // Full countdown display
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${
        isUrgent
          ? "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200"
          : isWarning
          ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200"
          : "bg-gradient-to-r from-gray-50 to-white border border-gray-200"
      }`}
    >
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-xl ${
              isUrgent ? "bg-red-100" : isWarning ? "bg-orange-100" : "bg-gray-100"
            }`}
          >
            <Clock
              className={`w-5 h-5 ${
                isUrgent ? "text-red-600" : isWarning ? "text-orange-600" : "text-gray-600"
              }`}
            />
          </div>
          <div>
            <p
              className={`text-sm font-medium ${
                isUrgent ? "text-red-700" : isWarning ? "text-orange-700" : "text-gray-700"
              }`}
            >
              {isUrgent ? "Quote Expires Soon!" : isWarning ? "Limited Time Offer" : "Quote Valid For"}
            </p>
            <p className="text-xs text-gray-500">
              Expires {new Date(expiresAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Countdown Grid */}
        <div className="grid grid-cols-4 gap-3">
          <TimeUnit value={timeLeft.days} label="Days" isUrgent={isUrgent} isWarning={isWarning} />
          <TimeUnit value={timeLeft.hours} label="Hours" isUrgent={isUrgent} isWarning={isWarning} />
          <TimeUnit value={timeLeft.minutes} label="Mins" isUrgent={isUrgent} isWarning={isWarning} />
          <TimeUnit value={timeLeft.seconds} label="Secs" isUrgent={isUrgent} isWarning={isWarning} animate />
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isUrgent ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-green-500"
              }`}
              initial={{ width: "100%" }}
              animate={{
                width: `${Math.max(5, Math.min(100, (timeLeft.total / (7 * 24 * 60 * 60 * 1000)) * 100))}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Urgency CTA */}
      {isUrgent && (
        <div className="px-6 py-3 bg-red-500 text-white text-center">
          <p className="text-sm font-medium">
            Book now to lock in this price!
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Time Unit Component
function TimeUnit({
  value,
  label,
  isUrgent,
  isWarning,
  animate,
}: {
  value: number;
  label: string;
  isUrgent: boolean;
  isWarning: boolean;
  animate?: boolean;
}) {
  return (
    <div className="text-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={animate ? { y: -10, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={animate ? { y: 10, opacity: 0 } : undefined}
          transition={{ duration: 0.2 }}
          className={`text-2xl font-bold ${
            isUrgent ? "text-red-600" : isWarning ? "text-orange-600" : "text-gray-900"
          }`}
        >
          {String(value).padStart(2, "0")}
        </motion.div>
      </AnimatePresence>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}
