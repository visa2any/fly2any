'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import AvatarUploadModal from './AvatarUploadModal';

interface AvatarUploadButtonProps {
  userId: string;
  currentAvatar: string | null;
}

export default function AvatarUploadButton({ userId, currentAvatar }: AvatarUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Upload avatar"
      >
        <Camera className="w-5 h-5" />
      </button>

      <AvatarUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        currentAvatar={currentAvatar}
      />
    </>
  );
}
