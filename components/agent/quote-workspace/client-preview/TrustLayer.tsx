"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Clock, HeadphonesIcon, CheckCircle2, Star, Award, Users } from "lucide-react";
import { trustCopy } from "./EmotionalCopySystem";

interface TrustLayerProps {
  variant?: "full" | "compact";
  showStats?: boolean;
}

// Trust statistics (can be made dynamic)
const trustStats = [
  { icon: Users, value: "50,000+", label: "Happy Travelers" },
  { icon: Star, value: "4.9", label: "Average Rating" },
  { icon: Award, value: "15+", label: "Years Experience" },
];

export default function TrustLayer({ variant = "full", showStats = true }: TrustLayerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100"
      >
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-600">Secure Booking</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">No Hidden Fees</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600">24/7 Support</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      {/* Trust Stats */}
      {showStats && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3"
        >
          {trustStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100 text-center"
              >
                <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Trust Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Booking Confidence */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">{trustCopy.booking.headline}</h4>
          </div>
          <ul className="space-y-1.5">
            {trustCopy.booking.points.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Flexibility */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">{trustCopy.flexibility.headline}</h4>
          </div>
          <ul className="space-y-1.5">
            {trustCopy.flexibility.points.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
          {trustCopy.flexibility.disclaimer && (
            <p className="text-[9px] text-gray-400 mt-2">{trustCopy.flexibility.disclaimer}</p>
          )}
        </motion.div>

        {/* Support */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
              <HeadphonesIcon className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">{trustCopy.support.headline}</h4>
          </div>
          <ul className="space-y-1.5">
            {trustCopy.support.points.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <CheckCircle2 className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Bottom trust badges */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-4 pt-2"
      >
        <div className="flex items-center gap-1.5 text-gray-400">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-medium">256-bit SSL</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-gray-400">
          <Lock className="w-4 h-4" />
          <span className="text-[10px] font-medium">PCI Compliant</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-gray-400">
          <Award className="w-4 h-4" />
          <span className="text-[10px] font-medium">ASTA Member</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
