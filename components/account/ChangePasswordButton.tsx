'use client';

import { useState } from 'react';
import { Key } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function ChangePasswordButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        <Key className="w-4 h-4" />
        Change Password
      </button>

      <ChangePasswordModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
