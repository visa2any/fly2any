// components/client/QuoteDetails.tsx
interface QuoteDetailsProps {
  quote: {
    travelers: number;
    adults: number;
    children: number;
    infants: number;
    destination: string;
    startDate: Date;
    endDate: Date;
    notes?: string | null;
    agent: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
}

export default function QuoteDetails({ quote }: QuoteDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Trip Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Travelers */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Travelers</h3>
          <div className="space-y-2">
            {quote.adults > 0 && (
              <div className="flex items-center text-gray-900">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  {quote.adults} {quote.adults === 1 ? "Adult" : "Adults"}
                </span>
              </div>
            )}
            {quote.children > 0 && (
              <div className="flex items-center text-gray-900">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  {quote.children} {quote.children === 1 ? "Child" : "Children"}
                </span>
              </div>
            )}
            {quote.infants > 0 && (
              <div className="flex items-center text-gray-900">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  {quote.infants} {quote.infants === 1 ? "Infant" : "Infants"}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">Total: {quote.travelers} travelers</p>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Travel Dates</h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Departure</p>
                <p className="text-gray-900 font-medium">
                  {new Date(quote.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Return</p>
                <p className="text-gray-900 font-medium">
                  {new Date(quote.endDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes from Agent */}
      {quote.notes && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Message from Your Travel Agent</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        </div>
      )}

      {/* Agent Contact */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Your Travel Agent</h3>
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg mr-3">
            {quote.agent.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{quote.agent.name}</p>
            <div className="mt-2 space-y-1">
              <a
                href={`mailto:${quote.agent.email}`}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {quote.agent.email}
              </a>
              {quote.agent.phone && (
                <a
                  href={`tel:${quote.agent.phone}`}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {quote.agent.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
