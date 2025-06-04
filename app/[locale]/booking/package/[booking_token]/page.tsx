import BookingClient from "./BookingClient";

export default async function BookingPage({ params }: { params: Promise<{ booking_token: string; locale: string }> }) {
  const { booking_token } = await params;
  return <BookingClient booking_token={booking_token} />;
}