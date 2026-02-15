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
        name: `Bedroom ${rooms.filter(r => r.name.includes('Bedroom')).length + 1}`,
        roomType: 'standard',
        bedType: 'queen',
        bedCount: 1,
        maxOccupancy: 2,
        quantity: 1,
        basePricePerNight: 0,
        amenities: []
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
                            value={room.name}
                            onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                            className="font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-primary-500 outline-none transition-colors"
                        />
                         <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                             <span className="capitalize">{room.roomType.replace('_', ' ')}</span>
                             <span>•</span>
                             <span>{room.maxOccupancy} Guests</span>
                         </div>
                     </div>
                     <button 
                        onClick={() => removeRoom(room.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Bed Type</label>
                        <select 
                            value={room.bedType}
                            onChange={(e) => updateRoom(room.id, { bedType: e.target.value as any })}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            {Object.entries(BED_TYPES).map(([k, l]) => (
                                <option key={k} value={k}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Count</label>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => updateRoom(room.id, { bedCount: Math.max(0, room.bedCount - 1) })}
                                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-600"
                            >-</button>
                            <span className="font-bold text-gray-900 w-4 text-center">{room.bedCount}</span>
                            <button
                                onClick={() => updateRoom(room.id, { bedCount: room.bedCount + 1 })}
                                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-600"
                            >+</button>
                        </div>
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
