'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

interface EditProfileButtonProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    country: string | null;
    timezone: string | null;
    bio: string | null;
  };
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        <Edit className="w-4 h-4" />
        Edit Profile
      </button>

      <EditProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} user={user} />
    </>
  );
}
