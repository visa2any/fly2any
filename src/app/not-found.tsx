import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | Fly2Any</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8fafc'
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
      </body>
    </html>
  );
}
