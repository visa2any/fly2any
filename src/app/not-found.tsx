'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#666' }}>Page Not Found</h2>
      <p style={{ marginBottom: '30px', color: '#999' }}>
        The page you are looking for does not exist.
      </p>
      <Link 
        href="/" 
        style={{
          padding: '12px 24px',
          backgroundColor: '#1B4F7F',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}
      >
        Return to Homepage
      </Link>
    </div>
  );
}
