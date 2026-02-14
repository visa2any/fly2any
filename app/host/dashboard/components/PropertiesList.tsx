
  import { prisma } from '@/lib/prisma';
  import Image from 'next/image';
  import Link from 'next/link';
  import { MapPin, Edit2, Trash2, CameraOff, Home, ExternalLink } from 'lucide-react';
  
  export async function PropertiesList({ userId }: { userId: string }) {
      // Intentionally delay to show skeleton if needed? No, let's just fetch.
      const properties = await prisma.property.findMany({
          where: { 
              // hostId: userId 
          },
          include: { images: true },
          orderBy: { createdAt: 'desc' }
      });
  
      if (properties.length === 0) {
          return (
             <div className="p-12 rounded-3xl border-2 border-dashed border-neutral-200 text-center bg-white/50 hover:bg-white hover:border-primary-200 transition-all group">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Home className="w-10 h-10 text-primary-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties yet</h3>
                 <p className="text-gray-500 mb-8 max-w-md mx-auto">Start earning by listing your first property today. It only takes a few minutes to get started.</p>
                 <Link href="/list-your-property/create" className="inline-flex px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 transition-all">
                    List your property
                 </Link>
             </div>
          );
      }
  
      return (
          <div className="grid gap-6">
              {properties.map(p => (
                  <div key={p.id} className="group p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:border-primary-100/50 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center">
                      {/* Image */}
                      <div className="relative w-full md:w-72 h-48 md:h-48 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 shadow-inner">
                          {p.images?.[0]?.url && p.images[0].url.startsWith('http') ? (
                              <Image 
                                 src={p.images[0].url} 
                                 alt={p.name || 'Property Image'} 
                                 fill 
                                 className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                 unoptimized={true}
                              />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                  <CameraOff className="w-8 h-8 opacity-50" />
                                  <span className="text-xs font-bold uppercase">No Image</span>
                              </div>
                          )}
                          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-xs font-black uppercase text-gray-900 shadow-sm">
                             {p.status || 'Draft'}
                          </div>
                          
                          {/* Price Tag Overlay */}
                          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-neutral-900/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                             ${p.basePricePerNight}/night
                          </div>
                      </div>
  
                      {/* Details */}
                      <div className="flex-1 text-center md:text-left w-full space-y-4">
                          <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight">
                                  {p.name || 'Untitled Property'}
                              </h3>
                              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                                 <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-100">
                                    <MapPin className="w-3.5 h-3.5" /> {p.city || 'No Location'}, {p.country}
                                 </span>
                                 <span className="hidden md:inline text-neutral-300">•</span>
                                 <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                              </div>
                          </div>
                          
                          <p className="text-gray-500 text-sm line-clamp-2 max-w-xl mx-auto md:mx-0">
                              {p.description || "No description provided."}
                          </p>
                          
                          <div className="pt-4 flex items-center justify-center md:justify-start gap-3">
                              <Link 
                                 href={`/list-your-property/create?id=${p.id}`}
                                 className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-neutral-900/10 text-sm"
                              >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit Listing
                              </Link>
                              
                              <Link href={`#`} className="px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-gray-700 font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center gap-2 text-sm">
                                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                              </Link>
  
                              <button className="px-3 py-2.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors ml-auto md:ml-0 md:border md:border-transparent md:hover:border-red-200">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      );
  }
