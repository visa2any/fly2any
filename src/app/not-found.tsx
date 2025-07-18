export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '1.2rem' }}>
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
