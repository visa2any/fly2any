"use client";

export default function SuppliersClient({ suppliers }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier: any) => (
        <div
          key={supplier.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
              <p className="text-sm text-gray-600">{supplier.type}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">{supplier.description}</p>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Services:</p>
              <div className="flex flex-wrap gap-1">
                {supplier.services.map((service: string) => (
                  <span
                    key={service}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Contact:</span> {supplier.contact}
              </p>
              {supplier.website && (
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
