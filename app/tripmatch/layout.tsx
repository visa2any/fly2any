import TripMatchNav from '@/components/tripmatch/TripMatchNav';

export default function TripMatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TripMatchNav />
      {children}
    </div>
  );
}
