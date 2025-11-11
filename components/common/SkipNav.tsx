'use client';

/**
 * SkipNav Component
 *
 * Provides skip navigation links for keyboard users to bypass repetitive content
 * and jump directly to main content sections.
 *
 * WCAG 2.1 Level A Compliance: 2.4.1 Bypass Blocks
 */

interface SkipNavProps {
  mainContentId?: string;
  searchFormId?: string;
  navigationId?: string;
}

export default function SkipNav({
  mainContentId = 'main-content',
  searchFormId = 'search-form',
  navigationId = 'main-navigation',
}: SkipNavProps) {
  return (
    <div className="skip-nav-container">
      <a href={`#${mainContentId}`} className="skip-link">
        Skip to main content
      </a>
      <a href={`#${searchFormId}`} className="skip-link">
        Skip to search
      </a>
      <a href={`#${navigationId}`} className="skip-link">
        Skip to navigation
      </a>

      <style jsx>{`
        .skip-nav-container {
          position: relative;
        }

        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #0070DB;
          color: white;
          padding: 8px 16px;
          text-decoration: none;
          z-index: 9999;
          border-radius: 0 0 4px 0;
          font-weight: 600;
          font-size: 14px;
          transition: top 0.2s ease;
        }

        .skip-link:focus {
          top: 0;
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }

        .skip-link:not(:focus) {
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          height: 1px;
          overflow: hidden;
          position: absolute;
          white-space: nowrap;
          width: 1px;
        }

        .skip-link + .skip-link {
          left: auto;
          right: 0;
          border-radius: 0 0 0 4px;
        }

        .skip-link:focus + .skip-link {
          top: 0;
        }
      `}</style>
    </div>
  );
}
