import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function QuoteNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
        <p className="text-gray-600 mb-6">
          This quote doesn't exist or the link may have expired. Please check
          with your travel advisor for the correct link.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Go to Fly2Any
        </Link>
      </div>
    </div>
  );
}
