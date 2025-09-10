import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Fly2Any',
};

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '48px', 
        marginBottom: '20px', 
        color: '#1f2937',
        fontWeight: 'bold'
      }}>
        404
      </h1>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '20px', 
        color: '#6b7280' 
      }}>
        Page Not Found
      </h2>
      <p style={{ 
        marginBottom: '30px', 
        color: '#9ca3af',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/" 
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#1B4F7F',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          transition: 'background-color 0.2s'
        }}
      >
        Return to Homepage
      </Link>
    </div>
  );
}
