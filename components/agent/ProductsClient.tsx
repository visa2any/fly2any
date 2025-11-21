"use client";

export default function ProductsClient({ products }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product: any) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-4xl mb-4">{product.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{product.description}</p>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Features:</p>
            <ul className="space-y-1">
              {product.features.map((feature: string, index: number) => (
                <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
