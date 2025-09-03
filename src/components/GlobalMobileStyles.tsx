'use client';
import React from 'react';

export default function GlobalMobileStyles() {
  return (
    <style jsx={true} global={true}>{`
      /* CSS Custom Properties for consistent theming */
      :root {
        --mobile-touch-target: 44px;
        --mobile-touch-target-small: 40px;
        --mobile-border-radius: 12px;
        --mobile-border-radius-large: 16px;
        --mobile-spacing-xs: 2px;
        --mobile-spacing-sm: 6px;
        --mobile-spacing-md: 12px;
        --mobile-spacing-lg: 18px;
        --mobile-spacing-xl: 24px;
        
        /* Compact form spacing for mobile */
        --mobile-form-field-spacing: 12px;
        --mobile-label-spacing: 2px;
        --mobile-form-gap: 8px;
        --mobile-animation-fast: 150ms;
        --mobile-animation-normal: 200ms;
        --mobile-animation-slow: 300ms;
        --mobile-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
        --mobile-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
        --mobile-shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.2);
      }

      /* Enhanced scroll behavior */
      html {
        scroll-behavior: smooth;
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Header visibility classes */
      .mobile-header-container {
        display: none;
      }
      
      .desktop-header-container {
        display: block;
      }
      
      /* Enhanced animations */
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      @keyframes flashPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }

      @keyframes slideInFromBottom {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInFromTop {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fadeInScale {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      /* Enhanced loading skeleton */
      @keyframes skeleton {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }

      .mobile-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: skeleton 1.5s infinite linear;
      }

      /* Mobile-first responsive styles */
      @media (max-width: 767px) {
        /* CRITICAL FIX: Show mobile app container, hide desktop container on mobile */
        .mobile-app-container {
          display: block !important;
        }
        
        .desktop-content-container {
          display: none !important;
        }
        
        /* Show mobile header, hide desktop header on mobile */
        .mobile-header-container {
          display: block !important;
        }
        
        .desktop-header-container {
          display: none !important;
        }

        /* Enhanced body styling */
        body {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain !important;
          overflow-x: hidden !important;
        }

        /* Fix white space issues */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
        }

        /* Mobile main content wrapper */
        .mobile-main-content {
          width: 100% !important;
          max-width: 100vw !important;
          overflow-x: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .mobile-main-content-with-bottom-nav {
          width: 100% !important;
          max-width: 100vw !important;
          overflow-x: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          padding-bottom: 80px !important; /* Space for bottom nav */
        }

        /* App-style mobile container - Single screen experience */
        .mobile-app-container {
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Safe area support for newer devices */
        .mobile-safe-area-top {
          padding-top: env(safe-area-inset-top) !important;
        }

        .mobile-safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom) !important;
        }

        .mobile-safe-area-left {
          padding-left: env(safe-area-inset-left) !important;
        }

        .mobile-safe-area-right {
          padding-right: env(safe-area-inset-right) !important;
        }
        
        /* Enhanced container styling */
        .mobile-container {
          padding: var(--mobile-spacing-md) 0 !important; /* Removed horizontal padding */
          margin: 0 auto !important;
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }

        .mobile-container-fluid {
          padding: 0 !important; /* Removed all padding for full width */
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }

        /* Fix overflow for all mobile containers */
        .mobile-overflow-hidden {
          overflow-x: hidden !important;
          max-width: 100vw !important;
          width: 100% !important;
        }
        
        /* Enhanced grid system */
        .mobile-grid-single {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: var(--mobile-spacing-md) !important;
        }
        
        .mobile-grid-two {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: var(--mobile-spacing-sm) !important;
        }

        .mobile-grid-auto {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
          gap: var(--mobile-spacing-md) !important;
        }
        
        /* Enhanced typography */
        .mobile-title {
          font-size: clamp(18px, 5vw, 24px) !important; /* Reduced size range */
          line-height: 1.15 !important;
          text-align: center !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          margin-bottom: 16px !important;
        }
        
        .mobile-subtitle {
          font-size: clamp(13px, 3.5vw, 16px) !important; /* Reduced size range */
          line-height: 1.4 !important;
          text-align: center !important;
          font-weight: 500 !important;
          margin-bottom: 24px !important;
        }
        
        .mobile-text {
          font-size: 14px !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }

        .mobile-text-center {
          text-align: center !important;
        }

        .mobile-text-large {
          font-size: 16px !important;
          line-height: 1.4 !important;
        }

        .mobile-text-small {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        
        /* Enhanced button system */
        .mobile-button {
          width: 100% !important;
          min-height: var(--mobile-touch-target) !important;
          padding: 12px 16px !important; /* Reduced padding for better mobile fit */
          font-size: 13px !important; /* Smaller font for mobile */
          font-weight: 600 !important;
          text-align: center !important;
          border-radius: 8px !important; /* Slightly smaller radius */
          border: none !important;
          cursor: pointer !important;
          transition: all var(--mobile-animation-normal) ease !important;
          position: relative !important;
          overflow: hidden !important;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation !important;
        }

        .mobile-button:active {
          transform: translateY(1px) !important;
          box-shadow: var(--mobile-shadow-sm) !important;
        }

        .mobile-button-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
          box-shadow: var(--mobile-shadow-md) !important;
        }

        .mobile-button-secondary {
          background: #f8fafc !important;
          color: #334155 !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: var(--mobile-shadow-sm) !important;
        }

        .mobile-button-icon {
          min-width: var(--mobile-touch-target) !important;
          min-height: var(--mobile-touch-target) !important;
          padding: var(--mobile-spacing-sm) !important;
          border-radius: 50% !important;
        }
        
        .mobile-button-group {
          display: flex !important;
          flex-direction: column !important;
          gap: var(--mobile-spacing-sm) !important;
          width: 100% !important;
        }

        .mobile-button-group-horizontal {
          flex-direction: row !important;
        }

        .mobile-button-group-horizontal .mobile-button {
          flex: 1 !important;
          width: auto !important;
        }
        
        /* Enhanced form styling */
        .mobile-form {
          padding: var(--mobile-spacing-md) var(--mobile-spacing-sm) !important;
          margin: var(--mobile-spacing-sm) 0 !important;
          border-radius: var(--mobile-border-radius) !important;
          background: white !important;
          box-shadow: var(--mobile-shadow-md) !important;
          border: 1px solid #e2e8f0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }

        /* Mobile form container fixes */
        .mobile-form-container {
          width: 100% !important;
          max-width: 100vw !important;
          padding: 0 !important; /* Removed horizontal padding */
          box-sizing: border-box !important;
          overflow: visible !important; /* Changed from hidden to visible */
          position: relative !important;
          z-index: 100 !important; /* Ensure form is above overlays */
        }

        /* Fix mobile hero form positioning */
        .mobile-hero-form {
          position: relative !important; /* Changed from absolute */
          width: calc(100% - 32px) !important;
          max-width: 400px !important;
          margin: 0 auto !important;
          z-index: 100 !important; /* High z-index to prevent overlapping */
        }

        /* ULTRATHINK: Compact form field spacing optimization */
        .mobile-form-field {
          margin-bottom: var(--mobile-form-field-spacing) !important;
        }
        
        .mobile-form-label {
          margin-bottom: var(--mobile-label-spacing) !important;
          font-size: 13px !important;
        }
        
        .mobile-form-gap {
          gap: var(--mobile-form-gap) !important;
        }
        
        .mobile-form-row {
          display: flex !important;
          flex-direction: column !important;
          gap: var(--mobile-spacing-md) !important;
          margin-bottom: var(--mobile-spacing-md) !important;
        }

        .mobile-form-group {
          display: flex !important;
          flex-direction: column !important;
          gap: var(--mobile-spacing-xs) !important;
        }

        .mobile-form-label {
          font-weight: 500 !important;
          font-size: 14px !important;
          color: #374151 !important;
          margin-bottom: var(--mobile-spacing-xs) !important;
        }
        
        .mobile-form-input {
          width: 100% !important;
          min-height: 40px !important; /* Fixed height for consistency */
          padding: 10px 14px !important; /* Optimized padding */
          font-size: 16px !important; /* Keep 16px to prevent zoom on iOS */
          border-radius: 8px !important; /* Slightly smaller radius */
          border: 1px solid #d1d5db !important;
          background: white !important;
          transition: all var(--mobile-animation-normal) ease !important;
          -webkit-appearance: none !important;
          -webkit-tap-highlight-color: transparent !important;
          box-sizing: border-box !important;
        }

        .mobile-form-input:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          background: #fefefe !important;
        }

        .mobile-form-input::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }

        .mobile-form-textarea {
          min-height: 100px !important;
          resize: vertical !important;
        }

        .mobile-form-select {
          background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>") !important;
          background-repeat: no-repeat !important;
          background-position: right 12px center !important;
          background-size: 12px !important;
          padding-right: 40px !important;
        }
        
        /* Enhanced section styling */
        .mobile-section {
          padding: var(--mobile-spacing-xl) 0 !important; /* Removed horizontal padding */
          margin: 0 !important;
        }

        /* Full-width mobile sections */
        .mobile-section-full-width {
          width: 100% !important;
          max-width: 100vw !important;
          margin: 0 !important;
          padding: var(--mobile-spacing-xl) 0 !important;
        }
        
        .mobile-section-content {
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 auto !important;
        }

        .mobile-section-hero {
          padding: calc(var(--mobile-spacing-xl) * 2) 0 !important; /* Removed horizontal padding */
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
        }
        
        /* Enhanced card system */
        .mobile-card {
          padding: var(--mobile-spacing-md) var(--mobile-spacing-xs) !important; /* Reduced horizontal padding */
          margin: var(--mobile-spacing-xs) var(--mobile-spacing-xs) !important; /* Added horizontal margin */
          border-radius: var(--mobile-border-radius) !important;
          background: white !important;
          box-shadow: var(--mobile-shadow-sm) !important;
          border: 1px solid #e5e7eb !important;
          transition: all var(--mobile-animation-normal) ease !important;
        }

        .mobile-card:active {
          transform: translateY(1px) !important;
          box-shadow: var(--mobile-shadow-md) !important;
        }

        .mobile-card-elevated {
          box-shadow: var(--mobile-shadow-lg) !important;
          border: none !important;
        }

        .mobile-card-interactive {
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .mobile-card-interactive:hover {
          box-shadow: var(--mobile-shadow-md) !important;
          transform: translateY(-1px) !important;
        }
        
        /* Navigation spacing for mobile header */
        .mobile-main-content {
          margin-top: 70px !important;
          min-height: calc(100vh - 70px) !important;
        }

        .mobile-main-content-with-bottom-nav {
          margin-bottom: 80px !important;
        }
        
        /* Visibility utilities */
        .desktop-only {
          display: none !important;
        }
        
        .mobile-only {
          display: block !important;
        }

        .mobile-flex {
          display: flex !important;
        }

        .mobile-inline-block {
          display: inline-block !important;
        }
        
        /* Enhanced spacing system */
        .mobile-spacing-xs {
          margin: var(--mobile-spacing-xs) 0 !important;
        }
        
        .mobile-spacing-sm {
          margin: var(--mobile-spacing-sm) 0 !important;
        }
        
        .mobile-spacing-md {
          margin: var(--mobile-spacing-md) 0 !important;
        }
        
        .mobile-spacing-lg {
          margin: var(--mobile-spacing-lg) 0 !important;
        }

        .mobile-spacing-xl {
          margin: var(--mobile-spacing-xl) 0 !important;
        }

        /* Padding utilities */
        .mobile-p-xs { padding: var(--mobile-spacing-xs) !important; }
        .mobile-p-sm { padding: var(--mobile-spacing-sm) !important; }
        .mobile-p-md { padding: var(--mobile-spacing-md) !important; }
        .mobile-p-lg { padding: var(--mobile-spacing-lg) !important; }
        .mobile-p-xl { padding: var(--mobile-spacing-xl) !important; }

        .mobile-px-xs { padding-left: var(--mobile-spacing-xs) !important; padding-right: var(--mobile-spacing-xs) !important; }
        .mobile-px-sm { padding-left: var(--mobile-spacing-sm) !important; padding-right: var(--mobile-spacing-sm) !important; }
        .mobile-px-md { padding-left: var(--mobile-spacing-md) !important; padding-right: var(--mobile-spacing-md) !important; }
        .mobile-px-lg { padding-left: var(--mobile-spacing-lg) !important; padding-right: var(--mobile-spacing-lg) !important; }

        .mobile-py-xs { padding-top: var(--mobile-spacing-xs) !important; padding-bottom: var(--mobile-spacing-xs) !important; }
        .mobile-py-sm { padding-top: var(--mobile-spacing-sm) !important; padding-bottom: var(--mobile-spacing-sm) !important; }
        .mobile-py-md { padding-top: var(--mobile-spacing-md) !important; padding-bottom: var(--mobile-spacing-md) !important; }
        .mobile-py-lg { padding-top: var(--mobile-spacing-lg) !important; padding-bottom: var(--mobile-spacing-lg) !important; }
        
        /* Touch-friendly interactive elements */
        .mobile-touch-target {
          min-height: var(--mobile-touch-target) !important;
          min-width: var(--mobile-touch-target) !important;
          padding: var(--mobile-spacing-sm) !important;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation !important;
        }

        .mobile-touch-target-small {
          min-height: var(--mobile-touch-target-small) !important;
          min-width: var(--mobile-touch-target-small) !important;
        }

        /* Ripple effect for touch feedback */
        .mobile-ripple {
          position: relative !important;
          overflow: hidden !important;
        }

        .mobile-ripple::before {
          content: '' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          width: 0 !important;
          height: 0 !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.5) !important;
          transform: translate(-50%, -50%) !important;
          transition: width var(--mobile-animation-fast) ease, height var(--mobile-animation-fast) ease !important;
        }

        .mobile-ripple:active::before {
          width: 300px !important;
          height: 300px !important;
        }
        
        /* Performance optimizations */
        .mobile-no-animation * {
          animation: none !important;
          transition: none !important;
        }

        .mobile-gpu-accelerated {
          transform: translateZ(0) !important;
          will-change: transform !important;
        }
        
        /* Scroll and overflow handling */
        .mobile-overflow-hidden {
          overflow-x: hidden !important;
        }

        .mobile-overflow-scroll {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .mobile-scroll-smooth {
          scroll-behavior: smooth !important;
        }
        
        /* Enhanced table responsiveness */
        .mobile-table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .mobile-table-responsive {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
        }

        .mobile-table-responsive table {
          width: 100% !important;
          margin-bottom: 0 !important;
        }

        .mobile-table-stack {
          display: block !important;
        }

        .mobile-table-stack thead {
          display: none !important;
        }

        .mobile-table-stack tr {
          display: block !important;
          border: 1px solid #e5e7eb !important;
          border-radius: var(--mobile-border-radius) !important;
          padding: var(--mobile-spacing-md) !important;
          margin-bottom: var(--mobile-spacing-sm) !important;
          background: white !important;
        }

        .mobile-table-stack td {
          display: block !important;
          text-align: left !important;
          border: none !important;
          padding: var(--mobile-spacing-xs) 0 !important;
        }

        .mobile-table-stack td:before {
          content: attr(data-label) ": " !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }

        /* Loading states */
        .mobile-loading {
          pointer-events: none !important;
          opacity: 0.6 !important;
        }

        .mobile-loading::after {
          content: '' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          width: 20px !important;
          height: 20px !important;
          margin: -10px 0 0 -10px !important;
          border: 2px solid #f3f3f3 !important;
          border-top: 2px solid #3b82f6 !important;
          border-radius: 50% !important;
          animation: spin 1s linear infinite !important;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Modal and overlay enhancements */
        .mobile-modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 1000 !important;
          animation: fadeInScale var(--mobile-animation-normal) ease !important;
        }

        .mobile-modal-content {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          background: white !important;
          border-radius: var(--mobile-border-radius-large) var(--mobile-border-radius-large) 0 0 !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          animation: slideInFromBottom var(--mobile-animation-slow) ease !important;
          padding-bottom: env(safe-area-inset-bottom) !important;
        }

        /* Bottom sheet handle */
        .mobile-bottom-sheet-handle {
          width: 36px !important;
          height: 4px !important;
          background: #d1d5db !important;
          border-radius: 2px !important;
          margin: var(--mobile-spacing-sm) auto !important;
        }

        /* Notification styles */
        .mobile-notification {
          position: fixed !important;
          top: env(safe-area-inset-top, 20px) !important;
          left: var(--mobile-spacing-md) !important;
          right: var(--mobile-spacing-md) !important;
          background: white !important;
          border-radius: var(--mobile-border-radius) !important;
          box-shadow: var(--mobile-shadow-lg) !important;
          padding: var(--mobile-spacing-md) !important;
          z-index: 1100 !important;
          animation: slideInFromTop var(--mobile-animation-normal) ease !important;
        }

        /* Floating Action Button */
        .mobile-fab {
          position: fixed !important;
          bottom: calc(env(safe-area-inset-bottom) + var(--mobile-spacing-lg)) !important;
          right: var(--mobile-spacing-lg) !important;
          width: 56px !important;
          height: 56px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
          border: none !important;
          box-shadow: var(--mobile-shadow-lg) !important;
          cursor: pointer !important;
          z-index: 1000 !important;
          transition: all var(--mobile-animation-normal) ease !important;
        }
        
        /* Safe area padding utility */
        .pb-safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom, 16px) !important;
        }
        
        /* Date picker responsive positioning */
        .mobile-date-picker-modal {
          position: fixed !important;
          inset: 0 !important;
          z-index: 50 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 16px !important;
        }
        
        .mobile-date-picker-content {
          background: white !important;
          width: 100% !important;
          max-width: 384px !important;
          margin: 0 auto !important;
          border-radius: 12px !important;
          max-height: 80vh !important;
          overflow: hidden !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }

        .mobile-fab:active {
          transform: scale(0.95) !important;
        }

        /* Pull to refresh */
        .mobile-pull-to-refresh {
          transform: translateY(-60px) !important;
          transition: transform var(--mobile-animation-normal) ease !important;
        }

        .mobile-pull-to-refresh.refreshing {
          transform: translateY(0) !important;
        }
      }
      
      /* Enhanced tablet adjustments */
      @media (max-width: 1024px) and (min-width: 769px) {
        .tablet-grid-two {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: var(--mobile-spacing-lg) !important;
        }

        .tablet-grid-three {
          display: grid !important;
          grid-template-columns: 1fr 1fr 1fr !important;
          gap: var(--mobile-spacing-md) !important;
        }
        
        .tablet-container {
          padding: var(--mobile-spacing-lg) !important;
          max-width: 768px !important;
          margin: 0 auto !important;
        }
        
        .tablet-section {
          padding: calc(var(--mobile-spacing-xl) * 1.5) var(--mobile-spacing-lg) !important;
        }

        .tablet-modal-content {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 90% !important;
          max-width: 600px !important;
          height: auto !important;
          max-height: 80vh !important;
          border-radius: var(--mobile-border-radius) !important;
        }
      }
      
      /* Small mobile adjustments */
      @media (max-width: 480px) {
        :root {
          --mobile-spacing-xs: 2px;
          --mobile-spacing-sm: 4px;
          --mobile-spacing-md: 8px;
          --mobile-spacing-lg: 12px;
          --mobile-spacing-xl: 18px;
        }

        .small-mobile-title {
          font-size: clamp(16px, 5vw, 20px) !important; /* Further reduced */
        }
        
        .small-mobile-text {
          font-size: 13px !important;
        }
        
        .small-mobile-padding {
          padding: var(--mobile-spacing-sm) !important;
        }

        .mobile-container {
          padding: var(--mobile-spacing-sm) 0 !important; /* Vertical only */
        }

        .mobile-form {
          padding: var(--mobile-spacing-md) var(--mobile-spacing-sm) !important;
        }

        /* Make all buttons more compact on very small screens */
        .mobile-button, button {
          padding: 10px 14px !important;
          font-size: 12px !important;
          min-height: 38px !important;
        }

        /* Ensure text doesn't get too large */
        h1, h2, h3, h4 {
          font-size: clamp(14px, 4vw, 20px) !important;
          margin-bottom: 8px !important;
        }

        p {
          font-size: 13px !important;
          line-height: 1.4 !important;
        }

        /* Grid adjustments for small screens */
        .mobile-grid-two {
          grid-template-columns: 1fr !important;
          gap: var(--mobile-spacing-sm) !important;
        }
      }
      
      /* Landscape mobile adjustments */
      @media (max-width: 767px) and (orientation: landscape) {
        .mobile-landscape-header {
          height: 60px !important;
        }
        
        body {
          padding-top: 60px !important;
        }

        .mobile-main-content {
          margin-top: 60px !important;
        }

        .mobile-section {
          padding: var(--mobile-spacing-lg) var(--mobile-spacing-md) !important;
        }

        .mobile-modal-content {
          max-height: 85vh !important;
        }
        
        /* Date picker adjustments for landscape */
        .mobile-date-picker-modal {
          align-items: flex-end !important;
          padding: 0 !important;
        }
        
        .mobile-date-picker-content {
          max-width: none !important;
          border-radius: 12px 12px 0 0 !important;
          max-height: 60vh !important;
        }
        
        .pb-safe-area-inset-bottom {
          padding-bottom: 0 !important;
        }
      }

      /* High DPI / Retina display optimizations */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
        .mobile-border-hairline {
          border-width: 0.5px !important;
        }
      }

      /* Accessibility enhancements */
      @media (prefers-reduced-motion: reduce) {
        .mobile-no-animation,
        .mobile-no-animation * {
          animation: none !important;
          transition: none !important;
        }
      }

      @media (prefers-color-scheme: dark) {
        .mobile-dark-mode {
          background: #1f2937 !important;
          color: #f9fafb !important;
        }

        .mobile-dark-mode .mobile-card {
          background: #374151 !important;
          border-color: #4b5563 !important;
          color: #f9fafb !important;
        }

        .mobile-dark-mode .mobile-form-input {
          background: #374151 !important;
          border-color: #4b5563 !important;
          color: #f9fafb !important;
        }
      }

      /* Desktop responsive styles */
      @media (min-width: 768px) {
        /* CRITICAL FIX: Hide mobile app container, show desktop container on desktop */
        .mobile-app-container {
          display: none !important;
        }
        
        .desktop-content-container {
          display: block !important;
        }
      }

      /* Print styles for mobile */
      @media print {
        .mobile-no-print {
          display: none !important;
        }
      }
    `}</style>
  );
}