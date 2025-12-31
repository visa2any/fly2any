"use client";

import { format, parseISO, isToday, isTomorrow } from "date-fns";

interface DayMarkerProps {
  date: string;
  dayNumber: number;
}

export default function DayMarker({ date, dayNumber }: DayMarkerProps) {
  const parsedDate = parseISO(date);
  const dayName = format(parsedDate, "EEEE");
  const formattedDate = format(parsedDate, "MMM d, yyyy");

  // Special labels
  let specialLabel = "";
  if (isToday(parsedDate)) specialLabel = "Today";
  else if (isTomorrow(parsedDate)) specialLabel = "Tomorrow";

  return (
    <div className="flex items-center gap-3 mb-3">
      {/* Day number circle */}
      <div className="relative z-10 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-lg font-bold text-gray-900">{dayNumber}</span>
      </div>

      {/* Date info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{dayName}</span>
          {specialLabel && (
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              {specialLabel}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
    </div>
  );
}
