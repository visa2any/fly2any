'use client';

import { useState, useEffect } from 'react';
import GuestProfileForm from '@/components/guest/GuestProfileForm';
import { Guest } from '@/lib/api/liteapi-types';

export default function ProfilePage() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
      fetchGuest(storedGuestId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchGuest = async (id: string) => {
    try {
      const response = await fetch('/api/guests/' + id);
      const data = await response.json();
      if (data.success) {
        setGuest(data.data);
      }
    } catch (err) {
      console.error('Failed to load guest:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    if (guest && guestId) {
      const response = await fetch('/api/guests/' + guestId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setGuest(data.data);
        alert('Profile updated successfully!');
      }
    } else {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setGuest(data.data);
        setGuestId(data.data.id);
        localStorage.setItem('guestId', data.data.id);
        alert('Profile created successfully!');
      }
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      <GuestProfileForm guest={guest || undefined} onSave={handleSave} />
    </div>
  );
}
