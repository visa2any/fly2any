// components/agent/UpcomingTrips.tsx
import Link from "next/link";

interface UpcomingTripsProps {
  trips: Array<{
    id: string;
    confirmationNumber: string;
    tripName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    total: number;
    status: string;
    client: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export default function UpcomingTrips({ trips }: UpcomingTripsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-success-100 text-success-800";
      case "PENDING":
        return "bg-warning-100 text-warning-800";
      case "IN_PROGRESS":
        return "bg-info-100 text-info-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const tripDate = new Date(date);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
            <p className="text-sm text-gray-600 mt-1">Next {trips.length} departures</p>
          </div>
          <Link
            href="/agent/bookings"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {trips.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 text-sm">No upcoming trips</p>
            <Link
              href="/agent/quotes/create"
              className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first quote →
            </Link>
          </div>
        ) : (
          trips.map((trip) => {
            const daysUntil = getDaysUntil(trip.startDate);
            return (
              <Link
                key={trip.id}
                href={`/agent/bookings/${trip.id}`}
                className="p-4 hover:bg-gray-50 transition-colors block"
                aria-label={`View booking for ${trip.tripName} - ${trip.client.firstName} ${trip.client.lastName}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate" title={trip.tripName}>
                        {trip.tripName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                          trip.status
                        )}`}
                        title={`Status: ${trip.status}`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {trip.client.firstName} {trip.client.lastName}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {trip.destination}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${trip.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                        ? "Tomorrow"
                        : daysUntil < 0
                        ? "In progress"
                        : `${daysUntil} days`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {trips.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <Link
            href="/agent/bookings"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Bookings
          </Link>
        </div>
      )}
    </div>
  );
}
