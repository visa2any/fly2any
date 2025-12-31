import { Suspense } from "react";
import { Metadata } from "next";
import QuoteWorkspace from "./QuoteWorkspace";

export const metadata: Metadata = {
  title: "Quote Workspace | Fly2Any Agent",
  description: "Build and send professional travel quotes to your clients",
};

export default function QuoteWorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceLoadingSkeleton />}>
      <QuoteWorkspace />
    </Suspense>
  );
}

function WorkspaceLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header skeleton */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center gap-4">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr_340px]">
        <div className="hidden lg:block bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
        <div className="hidden lg:block bg-white border-l border-gray-200 p-4">
          <div className="space-y-4">
            <div className="h-32 bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="h-16 bg-white border-t border-gray-200 px-6 flex items-center justify-between">
        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-3">
          <div className="w-28 h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
