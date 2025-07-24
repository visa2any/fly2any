'use client';

export default function GlobalMobileStyles() {
  return (
    <style jsx global>{`
      /* Mobile-first responsive styles */
      @media (max-width: 768px) {
        /* Body and typography adjustments */
        body {
          padding-top: 70px !important;
          font-size: 16px;
        }
        
        /* Container padding adjustments */
        .mobile-container {
          padding: 16px !important;
          margin: 0 auto;
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
        
        /* Form mobile adjustments */
        .mobile-form {
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
        
        /* Section spacing mobile */
        .mobile-section {
          padding: 40px 16px !important;
          margin: 0 !important;
        }
        
        .mobile-section-content {
          max-width: 100% !important;
          padding: 0 !important;
        }
        
        /* Card mobile adjustments */
        .mobile-card {
          padding: 20px 16px !important;
          margin: 8px 0 !important;
          border-radius: 12px !important;
        }
        
        /* Navigation spacing for mobile header */
        .mobile-main-content {
          margin-top: 70px !important;
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
          padding-top: 60px !important;
        }
      }
    `}</style>
  );
}