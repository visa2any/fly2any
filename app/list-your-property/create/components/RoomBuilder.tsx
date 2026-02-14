'use client';

import { useState } from 'react';
import { Plus, Trash2, BedDouble, Bath, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { RoomType, BedType } from '@/lib/properties/types';

export interface RoomData {
  id: string; // temp id for frontend
  name: string;
  roomType: RoomType;
  bedType: BedType;
  bedCount: number;
  maxOccupancy: number;
  quantity: number;
  basePricePerNight: number;
  amenities: string[];
}

interface RoomBuilderProps {
  rooms: RoomData[];
  onChange: (rooms: RoomData[]) => void;
}

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'standard', label: 'Standard Room' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'studio', label: 'Studio' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'dormitory', label: 'Dormitory Bed' },
];

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: 'king', label: 'King Bed' },
  { value: 'queen', label: 'Queen Bed' },
  { value: 'double', label: 'Double Bed' },
  { value: 'twin', label: 'Twin Bed' },
  { value: 'single', label: 'Single Bed' },
  { value: 'bunk', label: 'Bunk Bed' },
  { value: 'sofa_bed', label: 'Sofa Bed' },
];

export function RoomBuilder({ rooms, onChange }: RoomBuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(rooms[0]?.id || null);

  const addRoom = () => {
    const newRoom: RoomData = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Bedroom ${rooms.length + 1}`,
      roomType: 'standard',
      bedType: 'queen',
      bedCount: 1,
      maxOccupancy: 2,
      quantity: 1,
      basePricePerNight: 100, // Default logic can be smarter
      amenities: [],
    };
    onChange([...rooms, newRoom]);
    setExpandedId(newRoom.id);
  };

  const updateRoom = (id: string, updates: Partial<RoomData>) => {
    onChange(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRoom = (id: string) => {
    onChange(rooms.filter(r => r.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {rooms.map((room, index) => (
        <div key={room.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all">
          {/* Header */}
          <div 
             onClick={() => toggleExpand(room.id)}
             className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
          >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-bold">
                   {index + 1}
                </div>
                <div>
                   <h3 className="font-bold text-white text-lg">{room.name}</h3>
                   <div className="text-sm text-white/50 flex items-center gap-3">
                      <span className="capitalize">{room.roomType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{room.bedCount} {room.bedType.replace('_', ' ')}</span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-2">
                {rooms.length > 1 && (
                   <button 
                      onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                      className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-white/30 transition-colors"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                )}
                {expandedId === room.id ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
             </div>
          </div>

          {/* Form Body */}
          {expandedId === room.id && (
             <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                   {/* Name */}
                   <div className="col-span-2">
                      <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Room Name</label>
                      <input 
                         type="text" 
                         value={room.name}
                         onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                         className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none"
                      />
                   </div>

                   {/* Type */}
                   <div>
                      <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Room Type</label>
                      <select 
                         value={room.roomType}
                         onChange={(e) => updateRoom(room.id, { roomType: e.target.value as RoomType })}
                         className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none [&>option]:text-black"
                      >
                         {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                   </div>

                   {/* Bed Type */}
                   <div>
                      <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Bed Type</label>
                      <select 
                         value={room.bedType}
                         onChange={(e) => updateRoom(room.id, { bedType: e.target.value as BedType })}
                         className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none [&>option]:text-black"
                      >
                         {BED_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                   </div>

                   {/* Counters */}
                   <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between border border-white/10">
                      <div className="flex items-center gap-2 text-white/70">
                         <BedDouble className="w-4 h-4" />
                         <span className="text-sm font-bold">Bed Count</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <button onClick={() => updateRoom(room.id, { bedCount: Math.max(1, room.bedCount - 1) })} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">-</button>
                         <span className="font-bold text-white w-4 text-center">{room.bedCount}</span>
                         <button onClick={() => updateRoom(room.id, { bedCount: room.bedCount + 1 })} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">+</button>
                      </div>
                   </div>

                   <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between border border-white/10">
                      <div className="flex items-center gap-2 text-white/70">
                         <Users className="w-4 h-4" />
                         <span className="text-sm font-bold">Max Guests</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <button onClick={() => updateRoom(room.id, { maxOccupancy: Math.max(1, room.maxOccupancy - 1) })} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">-</button>
                         <span className="font-bold text-white w-4 text-center">{room.maxOccupancy}</span>
                         <button onClick={() => updateRoom(room.id, { maxOccupancy: room.maxOccupancy + 1 })} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">+</button>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      ))}

      <button 
         onClick={addRoom}
         className="w-full py-4 border-2 border-dashed border-white/10 hover:border-amber-400/50 hover:bg-amber-400/5 rounded-xl text-white/50 hover:text-amber-400 font-bold flex items-center justify-center gap-2 transition-all group"
      >
         <div className="p-1 rounded-full bg-white/10 group-hover:bg-amber-400/20"><Plus className="w-4 h-4" /></div>
         Add Another Room
      </button>
    </div>
  );
}
