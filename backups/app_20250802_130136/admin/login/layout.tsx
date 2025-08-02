import SessionWrapper from '@/components/SessionWrapper';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
      {/* Login page with clean layout - no sidebar/navbar */}
      {children}
    </SessionWrapper>
  );
}