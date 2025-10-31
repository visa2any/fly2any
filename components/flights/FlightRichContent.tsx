'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Film, Info } from 'lucide-react';

interface FlightRichContentProps {
  isOpen: boolean;
  onClose: () => void;
  richContent: {
    cabinPhotos?: string[];
    seatPhotos?: string[];
    amenityDetails?: string[];
    videos?: string[];
  };
  airlineName?: string;
  aircraftType?: string;
  cabinClass?: string;
}

export function FlightRichContent({
  isOpen,
  onClose,
  richContent,
  airlineName = 'Airline',
  aircraftType = 'Aircraft',
  cabinClass = 'Economy',
}: FlightRichContentProps) {
  const [activeTab, setActiveTab] = useState<'cabin' | 'seats' | 'amenities' | 'videos'>('cabin');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen) return null;

  const hasContent = {
    cabin: (richContent.cabinPhotos?.length || 0) > 0,
    seats: (richContent.seatPhotos?.length || 0) > 0,
    amenities: (richContent.amenityDetails?.length || 0) > 0,
    videos: (richContent.videos?.length || 0) > 0,
  };

  const getCurrentImages = () => {
    if (activeTab === 'cabin') return richContent.cabinPhotos || [];
    if (activeTab === 'seats') return richContent.seatPhotos || [];
    return [];
  };

  const currentImages = getCurrentImages();

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-xl font-bold">NDC Exclusive Preview</h2>
            </div>
            <p className="text-sm text-blue-100">
              {airlineName} • {aircraftType} • {cabinClass} Class
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          {hasContent.cabin && (
            <button
              onClick={() => {
                setActiveTab('cabin');
                setSelectedImageIndex(0);
              }}
              className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'cabin'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Cabin Photos ({richContent.cabinPhotos?.length})
            </button>
          )}
          {hasContent.seats && (
            <button
              onClick={() => {
                setActiveTab('seats');
                setSelectedImageIndex(0);
              }}
              className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'seats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Seat Photos ({richContent.seatPhotos?.length})
            </button>
          )}
          {hasContent.amenities && (
            <button
              onClick={() => setActiveTab('amenities')}
              className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'amenities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info className="w-4 h-4" />
              Amenities ({richContent.amenityDetails?.length})
            </button>
          )}
          {hasContent.videos && (
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'videos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Film className="w-4 h-4" />
              Videos ({richContent.videos?.length})
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image Gallery (Cabin & Seats) */}
          {(activeTab === 'cabin' || activeTab === 'seats') && currentImages.length > 0 && (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <img
                  src={currentImages[selectedImageIndex]}
                  alt={`${activeTab} view ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full">
                  {selectedImageIndex + 1} / {currentImages.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {currentImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  {activeTab === 'cabin' && (
                    <span>
                      <strong>Cabin Overview:</strong> Get a real preview of the cabin interior, including seating layout,
                      lighting, and overall atmosphere. All photos are from actual flights on this aircraft type.
                    </span>
                  )}
                  {activeTab === 'seats' && (
                    <span>
                      <strong>Seat Details:</strong> View the actual seats you'll be sitting in, including legroom, recline,
                      and amenities. Photos show the exact configuration for {cabinClass} class.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Amenities List */}
          {activeTab === 'amenities' && richContent.amenityDetails && richContent.amenityDetails.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Detailed Amenity Information
                </h3>
                <p className="text-sm text-blue-700">
                  Complete details about services and amenities available on this flight, provided directly by the airline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {richContent.amenityDetails.map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-gray-700">{amenity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {activeTab === 'videos' && richContent.videos && richContent.videos.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Video Content
                </h3>
                <p className="text-sm text-blue-700">
                  Watch videos showcasing the flight experience, cabin features, and onboard services.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {richContent.videos.map((video, index) => (
                  <div key={index} className="bg-gray-900 rounded-xl overflow-hidden aspect-video">
                    <video
                      controls
                      className="w-full h-full"
                      poster="/placeholder-video.jpg"
                    >
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Content Fallback */}
          {!hasContent[activeTab] && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Available</h3>
              <p className="text-gray-600">
                Rich content for this section is not currently available.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            All content provided directly by {airlineName} through NDC connections
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
