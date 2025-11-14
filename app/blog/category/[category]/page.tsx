import ClientPage from './ClientPage';

// Required for static export (mobile builds)
// Generate a placeholder path for static export
// Real data will be fetched client-side via API
export async function generateStaticParams() {
  return [{ category: 'placeholder' }];
}

export default function Page() {
  return <ClientPage />;
}
