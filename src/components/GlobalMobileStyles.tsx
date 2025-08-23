'use client';

export default function GlobalMobileStyles() {
  return (
    <style jsx global>{`
      /* Mobile-first responsive styles - Native App Experience */
      @media (max-width: 768px) {
        /* Body and typography adjustments - ZERO PADDING */
        body {
          padding: 0 !important;
          margin: 0 !important;
          font-size: 16px;
          width: 100vw !important;
          overflow-x: hidden !important;
        }
        
        /* Container padding adjustments - FULL WIDTH */
        .mobile-container {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* Grid responsiveness */
        .mobile-grid-single {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        
        .mobile-grid-two {
          grid-template-columns: 1fr 1fr !important;
          gap: 12px !important;
        }
        
        /* Typography mobile adjustments */
        .mobile-title {
          font-size: 32px !important;
          line-height: 1.1 !important;
          text-align: center !important;
        }
        
        .mobile-subtitle {
          font-size: 18px !important;
          line-height: 1.4 !important;
          text-align: center !important;
        }
        
        .mobile-text {
          font-size: 16px !important;
          line-height: 1.5 !important;
          text-align: center !important;
        }
        
        /* Button mobile adjustments */
        .mobile-button {
          width: 100% !important;
          padding: 16px 24px !important;
          font-size: 16px !important;
          text-align: center !important;
          margin-bottom: 12px !important;
        }
        
        .mobile-button-group {
          flex-direction: column !important;
          gap: 12px !important;
          width: 100% !important;
        }
        
        /* Form mobile adjustments - Edge cards */
        .mobile-form {
          padding: 24px 16px !important;
          margin: 0 !important;
          border-radius: 0 !important;
          width: 100% !important;
        }
        
        .mobile-form-rounded {
          padding: 24px 16px !important;
          margin: 16px !important;
          border-radius: 16px !important;
        }
        
        .mobile-form-row {
          flex-direction: column !important;
          gap: 16px !important;
        }
        
        .mobile-form-input {
          width: 100% !important;
          padding: 14px !important;
          font-size: 16px !important;
          border-radius: 8px !important;
        }
        
        /* Section spacing mobile - EDGE TO EDGE */
        .mobile-section {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }
        
        .mobile-section-content {
          max-width: 100% !important;
          padding: 0 !important;
          width: 100% !important;
        }
        
        /* Safe area support for modern devices */
        .mobile-safe-area {
          padding-left: env(safe-area-inset-left) !important;
          padding-right: env(safe-area-inset-right) !important;
        }
        
        .mobile-safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom) !important;
        }
        
        /* Content that needs internal padding */
        .mobile-content-padding {
          padding: 0 16px !important;
        }
        
        /* Card mobile adjustments */
        .mobile-card {
          padding: 20px 16px !important;
          margin: 8px 0 !important;
          border-radius: 12px !important;
        }
        
        /* Navigation spacing for mobile header - NO TOP MARGIN */
        .mobile-main-content {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        /* Full height sections */
        .mobile-full-height {
          min-height: 100vh !important;
          height: 100vh !important;
        }
        
        .mobile-full-width {
          width: 100vw !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        /* Hide desktop-only elements */
        .desktop-only {
          display: none !important;
        }
        
        /* Show mobile-only elements */
        .mobile-only {
          display: block !important;
        }
        
        /* Flexible spacing */
        .mobile-spacing-small {
          margin: 8px 0 !important;
        }
        
        .mobile-spacing-medium {
          margin: 16px 0 !important;
        }
        
        .mobile-spacing-large {
          margin: 24px 0 !important;
        }
        
        /* Touch-friendly interactive elements */
        .mobile-touch-target {
          min-height: 44px !important;
          min-width: 44px !important;
          padding: 12px !important;
        }
        
        /* Mobile-optimized animations */
        .mobile-no-animation * {
          animation: none !important;
          transition: none !important;
        }
        
        /* Overflow handling */
        .mobile-overflow-hidden {
          overflow-x: hidden !important;
        }
        
        /* Mobile table responsiveness */
        .mobile-table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
        }
      }
      
      /* Tablet adjustments */
      @media (max-width: 1024px) and (min-width: 769px) {
        .tablet-grid-two {
          grid-template-columns: 1fr 1fr !important;
          gap: 20px !important;
        }
        
        .tablet-container {
          padding: 24px !important;
        }
        
        .tablet-section {
          padding: 60px 24px !important;
        }
      }
      
      /* Small mobile adjustments */
      @media (max-width: 480px) {
        .small-mobile-title {
          font-size: 28px !important;
        }
        
        .small-mobile-text {
          font-size: 14px !important;
        }
        
        .small-mobile-padding {
          padding: 12px !important;
        }
      }
      
      /* Landscape mobile adjustments */
      @media (max-width: 768px) and (orientation: landscape) {
        .mobile-landscape-header {
          height: 60px !important;
        }
        
        body {
          padding: 0 !important;
        }
      }
      
      /* App-like header styles */
      @media (max-width: 768px) {
        .mobile-header-fixed {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 1000 !important;
          width: 100% !important;
        }
        
        .mobile-header-transparent {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
        }
        
        /* Remove all default spacing */
        * {
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Ensure images are full width */
        .mobile-image-full {
          width: 100vw !important;
          margin-left: calc(-50vw + 50%) !important;
        }
      }
    `}</style>
  );
}