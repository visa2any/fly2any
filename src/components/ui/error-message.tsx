'use client';

import * as React from "react";

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <>
      <div className="error-message">
        <span>❌ {message}</span>
        <button onClick={onClose} type="button">×</button>
      </div>

      <style jsx={true}>{`
        .error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 600px;
          margin: 20px auto;
          padding: 16px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 12px;
          color: #dc2626;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .error-message button {
          background: none;
          border: none;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-message button:hover {
          opacity: 0.7;
        }
      `}</style>
    </>
  );
}

export { ErrorMessage };