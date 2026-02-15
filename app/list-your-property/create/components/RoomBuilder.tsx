'use client';

import { useState } from 'react';
import { RoomData, ROOM_TYPES, BED_TYPES } from '@/lib/properties/types';
import { Plus, Trash2, Bed, Bath, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';

interface RoomBuilderProps {
  rooms: RoomData[];
  onChange: (rooms: RoomData[]) => void;
}

export function RoomBuilder({ rooms, onChange }: RoomBuilderProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddRoom = () => {
    const newRoom: RoomData = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Bedroom ${rooms.filter(r => r.name?.includes('Bedroom')).length + 1}`,
        roomType: 'standard',
        bedType: 'queen',
        bedCount: 1,
        maxOccupancy: 2,
        quantity: 1,
        quantity: 1,
        basePricePerNight: 0,
        amenities: [],
        bathroomType: 'ensuite'
    };
    onChange([...rooms, newRoom]);
  };

  const updateRoom = (id: string, updates: Partial<RoomData>) => {
    onChange(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRoom = (id: string) => {
    onChange(rooms.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, index) => (
             <div key={room.id} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                        <input 
                            value={room.name || ''}
                            onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                            className="font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-primary-500 outline-none transition-colors mb-1"
                            placeholder="Room Name"
                        />
                         <div className="flex items-center gap-2 text-sm text-gray-500">
                             <select
                                value={room.roomType}
                                onChange={(e) => updateRoom(room.id, { roomType: e.target.value as any })}
                                className="bg-transparent border-none p-0 text-sm font-medium text-gray-500 hover:text-primary-600 focus:ring-0 cursor-pointer capitalize"
                             >
                                {Object.entries(ROOM_TYPES).map(([k, l]) => (
                                    <option key={k} value={k}>{l}</option>
                                ))}
                             </select>
                             <span>•</span>
                             <span>{room.maxOccupancy} Guests</span>
                         </div>
                     </div>
                     <div className="flex items-center gap-2">
                         {room.bathroomType === 'ensuite' && (
                             <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                 <Bath className="w-3 h-3" /> En-suite
                             </span>
                         )}
                         <button 
                            onClick={() => removeRoom(room.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                     </div>
                 </div>

                 <div className="grid grid-cols-12 gap-3 mb-4 items-end">
                    {/* Bed Type */}
                    <div className="col-span-6 sm:col-span-4 space-y-1.5">
                        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Bed Type</label>
                        <select 
                            value={room.bedType}
                            onChange={(e) => updateRoom(room.id, { bedType: e.target.value as any })}
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm"
                        >
                            {Object.entries(BED_TYPES).map(([k, l]) => (
                                <option key={k} value={k}>{l}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bed Count */}
                    <div className="col-span-3 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Beds</label>
                        <div className="flex items-center bg-white border border-neutral-200 rounded-xl px-1 py-1 shadow-sm">
                            <button 
                                onClick={() => updateRoom(room.id, { bedCount: Math.max(0, room.bedCount - 1) })}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
                                type="button"
                            >-</button>
                            <span className="flex-1 text-center font-bold text-neutral-700 text-sm">{room.bedCount}</span>
                            <button
                                onClick={() => updateRoom(room.id, { bedCount: room.bedCount + 1 })}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
                                type="button"
                            >+</button>
                        </div>
                    </div>

                    {/* Max Occupancy */}
                    <div className="col-span-3 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Guests</label>
                        <div className="flex items-center bg-white border border-neutral-200 rounded-xl px-1 py-1 shadow-sm">
                            <button 
                                onClick={() => updateRoom(room.id, { maxOccupancy: Math.max(1, room.maxOccupancy - 1) })}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
                                type="button"
                            >-</button>
                            <span className="flex-1 text-center font-bold text-neutral-700 text-sm">{room.maxOccupancy}</span>
                            <button
                                onClick={() => updateRoom(room.id, { maxOccupancy: room.maxOccupancy + 1 })}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors"
                                type="button"
                            >+</button>
                        </div>
                    </div>

                    {/* Bathroom Type */}
                    <div className="col-span-12 sm:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Bathroom</label>
                        <select
                            value={room.bathroomType || (room.enSuite ? 'ensuite' : 'none')}
                            onChange={(e) => updateRoom(room.id, { bathroomType: e.target.value as any, enSuite: e.target.value === 'ensuite' })}
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm"
                        >
                            <option value="none">No Bathroom</option>
                            <option value="ensuite">En-suite (Attached)</option>
                            <option value="private">Private (Separate)</option>
                            <option value="shared">Shared</option>
                        </select>
                    </div>
                </div>
             </div>
          ))}
       </div>

       <button 
           onClick={handleAddRoom}
           className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-semibold hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all"
       >
           <Plus className="w-5 h-5" />
           Add Another Room
       </button>
    </div>
  );
}
