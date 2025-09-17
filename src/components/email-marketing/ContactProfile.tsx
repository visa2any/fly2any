'use client';

import * as React from 'react';
import { useState } from 'react';
import { ContactProfile, ActivityEvent, ContactNote, ContactTag } from '../../lib/email-marketing/types';
import { format, formatDistanceToNow } from 'date-fns';

interface ContactProfileProps {
  contact: ContactProfile;
  onUpdate: (contact: ContactProfile) => void;
  onDelete: (contactId: string) => void;
}

export default function ContactProfileComponent({ contact, onUpdate, onDelete }: ContactProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'campaigns' | 'notes'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(contact);
  const [newNote, setNewNote] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      bounced: 'bg-red-100 text-red-800',
      unsubscribed: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    const icons = {
      email_sent: '📧',
      email_opened: '👀',
      link_clicked: '🔗',
      unsubscribed: '🚫',
      resubscribed: '✅',
      bounced: '❌',
      marked_spam: '⚠️',
      replied: '💬',
      forwarded: '↗️',
      profile_updated: '✏️',
      tag_added: '🏷️',
      tag_removed: '🗑️',
      list_added: '📋',
      list_removed: '📤'
    };
    return icons[type] || '📌';
  };

  const handleSave = () => {
    onUpdate(editedContact);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: ContactNote = {
        id: `note_${Date.now()}`,
        contactId: contact.id,
        content: newNote,
        createdBy: 'Current User',
        createdAt: new Date(),
        isPinned: false
      };
      
      const updatedContact = {
        ...contact,
        notes: [...contact.notes, note]
      };
      
      onUpdate(updatedContact);
      setNewNote('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !contact.tags.find(t => t.name === newTag)) {
      const tag: ContactTag = {
        id: `tag_${Date.now()}`,
        name: newTag,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        createdAt: new Date()
      };
      
      const updatedContact = {
        ...contact,
        tags: [...contact.tags, tag]
      };
      
      onUpdate(updatedContact);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedContact = {
      ...contact,
      tags: contact.tags.filter(t => t.id !== tagId)
    };
    onUpdate(updatedContact);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
              {contact.firstName?.[0]?.toUpperCase() || contact.email[0].toUpperCase()}
            </div>
            
            {/* Contact Info */}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(contact.status)}`}>
                  {contact.status}
                </span>
              </div>
              <p className="text-gray-600">{contact.email}</p>
              {contact.company && (
                <p className="text-sm text-gray-500">
                  {contact.position ? `${contact.position} at ` : ''}{contact.company}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(contact.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Engagement Score:</span>
            <div className={`px-3 py-1 rounded-full font-semibold ${getEngagementColor(contact.engagementScore)}`}>
              ⭐ {contact.engagementScore}/100
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last Activity: {contact.lastActivity ? formatDistanceToNow(new Date(contact.lastActivity), { addSuffix: true }) : 'Never'}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex items-center flex-wrap gap-2">
          {contact.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
          {showTagInput ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Add tag..."
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50"
            >
              + Add Tag
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['overview', 'timeline', 'campaigns', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm font-medium">{contact.email}</dd>
                </div>
                {contact.phone && (
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-sm font-medium">{contact.phone}</dd>
                  </div>
                )}
                {contact.city && (
                  <div>
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="text-sm font-medium">
                      {contact.city}{contact.state ? `, ${contact.state}` : ''}{contact.country ? `, ${contact.country}` : ''}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Subscription Date</dt>
                  <dd className="text-sm font-medium">
                    {format(new Date(contact.subscriptionDate), 'MMM dd, yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Source</dt>
                  <dd className="text-sm font-medium capitalize">{contact.source}</dd>
                </div>
              </dl>
            </div>

            {/* Email Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Email Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{contact.totalEmailsSent}</div>
                  <div className="text-sm text-gray-500">Emails Sent</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{contact.totalOpened}</div>
                  <div className="text-sm text-gray-500">Opened</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{contact.avgOpenRate}%</div>
                  <div className="text-sm text-gray-500">Open Rate</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{contact.avgClickRate}%</div>
                  <div className="text-sm text-gray-500">Click Rate</div>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            {Object.keys(contact.customFields).length > 0 && (
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-4">Custom Fields</h3>
                <dl className="grid grid-cols-3 gap-4">
                  {Object.entries(contact.customFields).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-sm font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
            {contact.timeline.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
            ) : (
              <div className="space-y-3">
                {contact.timeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="text-2xl">{getActivityIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      {event.details.campaignName && (
                        <p className="text-sm text-gray-600 mt-1">
                          Campaign: {event.details.campaignName}
                        </p>
                      )}
                      {event.details.emailSubject && (
                        <p className="text-sm text-gray-600 mt-1">
                          Subject: {event.details.emailSubject}
                        </p>
                      )}
                      {event.details.linkUrl && (
                        <p className="text-sm text-gray-600 mt-1">
                          Link: {event.details.linkUrl}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Campaign History</h3>
            <div className="text-center text-gray-500 py-8">
              Campaign history will be displayed here
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notes</h3>
              <button
                onClick={() => {/* Toggle add note form */}}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Add Note
              </button>
            </div>

            {/* Add Note Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add a note about this contact..."
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            {contact.notes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {contact.notes.map((note) => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-900">{note.content}</p>
                      {note.isPinned && (
                        <span className="text-yellow-500">📌</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        By {note.createdBy} • {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}