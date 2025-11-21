// components/client/QuoteItinerary.tsx
interface QuoteItineraryProps {
  quote: {
    flights: any;
    hotels: any;
    activities: any;
    transfers: any;
    carRentals: any;
    insurance: any;
    customItems: any;
  };
}

export default function QuoteItinerary({ quote }: QuoteItineraryProps) {
  const components = [
    {
      title: "Flights",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      data: quote.flights,
      color: "bg-blue-500",
    },
    {
      title: "Hotels",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      data: quote.hotels,
      color: "bg-purple-500",
    },
    {
      title: "Activities",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      data: quote.activities,
      color: "bg-green-500",
    },
    {
      title: "Transfers",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      data: quote.transfers,
      color: "bg-yellow-500",
    },
    {
      title: "Car Rentals",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
      data: quote.carRentals,
      color: "bg-orange-500",
    },
    {
      title: "Travel Insurance",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      data: quote.insurance,
      color: "bg-indigo-500",
    },
    {
      title: "Additional Items",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      data: quote.customItems,
      color: "bg-gray-500",
    },
  ];

  const hasItems = components.some(comp => comp.data && (Array.isArray(comp.data) ? comp.data.length > 0 : Object.keys(comp.data).length > 0));

  if (!hasItems) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600">Itinerary details will be added shortly</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">What's Included</h2>

      <div className="space-y-6">
        {components.map((component) => {
          // Check if component has data
          const hasData = component.data && (
            Array.isArray(component.data)
              ? component.data.length > 0
              : Object.keys(component.data).length > 0
          );

          if (!hasData) return null;

          return (
            <div key={component.title} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center mb-4">
                <div className={`${component.color} p-2 rounded-lg mr-3`}>
                  <div className="text-white">{component.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{component.title}</h3>
              </div>

              <div className="ml-11 space-y-3">
                {Array.isArray(component.data) ? (
                  component.data.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      {item.name && <p className="font-medium text-gray-900">{item.name}</p>}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {item.details && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(item.details).map(([key, value]: [string, any]) => (
                            <p key={key} className="text-xs text-gray-500">
                              <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {typeof component.data === "object" && (
                      <div className="space-y-2">
                        {Object.entries(component.data).map(([key, value]: [string, any]) => {
                          if (typeof value === "object" && value !== null) {
                            return (
                              <div key={key} className="mb-3">
                                <p className="font-medium text-gray-900 capitalize mb-1">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <div className="ml-3 space-y-1">
                                  {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                                    <p key={subKey} className="text-sm text-gray-600">
                                      <span className="font-medium capitalize">
                                        {subKey.replace(/_/g, " ")}:
                                      </span>{" "}
                                      {String(subValue)}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <p key={key} className="text-sm text-gray-600">
                              <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                              {String(value)}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
