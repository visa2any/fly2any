'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

interface DeleteAccountButtonProps {
  userId: string;
  userEmail: string;
}

export default function DeleteAccountButton({ userId, userEmail }: DeleteAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
      >
        <Trash2 className="w-4 h-4" />
        Delete Account
      </button>

      <DeleteAccountModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        userEmail={userEmail}
      />
    </>
  );
}
