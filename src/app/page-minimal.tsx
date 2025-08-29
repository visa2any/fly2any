'use client';

import React from 'react';

export default function Home() {
  console.log('🚀 Minimal Home page rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ 
        color: '#333',
        fontSize: '2rem',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Fly2Any - Minimal Test Page
      </h1>
      
      <p style={{
        color: '#666',
        fontSize: '1.1rem',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        If you can see this, Next.js is working correctly!
      </p>
      
      <div style={{
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer'
      }}>
        Test Button
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>
        Current time: {new Date().toLocaleString()}
      </div>
    </div>
  );
}