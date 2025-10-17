import BookingConfirmationWrapper from './BookingConfirmationWrapper';

// Force dynamic rendering since this page relies on search params
export const dynamic = 'force-dynamic';

export default function BookingConfirmationPage() {
  return <BookingConfirmationWrapper />;
}
