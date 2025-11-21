// components/client/QuoteHeader.tsx
interface QuoteHeaderProps {
  quote: {
    tripName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    status: string;
    expiresAt: Date;
    quoteNumber: string;
  };
}

export default function QuoteHeader({ quote }: QuoteHeaderProps) {
  const getStatusBadge = () => {
    const statusColors = {
      SENT: "bg-blue-100 text-blue-800",
      VIEWED: "bg-purple-100 text-purple-800",
      ACCEPTED: "bg-green-100 text-green-800",
      DECLINED: "bg-red-100 text-red-800",
      EXPIRED: "bg-gray-100 text-gray-800",
    };

    const isExpired = new Date() > quote.expiresAt;
    const status = isExpired ? "EXPIRED" : quote.status;
    const color = statusColors[status as keyof typeof statusColors] || statusColors.SENT;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-blue-700 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Quote Number */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-sm opacity-90 mr-3">Quote #{quote.quoteNumber}</span>
            {getStatusBadge()}
          </div>

          {/* Trip Name */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{quote.tripName}</h1>

          {/* Destination */}
          <div className="flex items-center justify-center text-lg mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="font-medium">{quote.destination}</span>
          </div>

          {/* Trip Details */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm opacity-95">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(quote.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(quote.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {quote.duration} {quote.duration === 1 ? "Day" : "Days"}
              </span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Expires{" "}
                {new Date(quote.expiresAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
