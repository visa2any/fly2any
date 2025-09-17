'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { format, addHours, addDays } from 'date-fns';
import { Contact, Segment } from '../../lib/email-marketing/utils';

interface CampaignSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    name: string;
    subject: string;
    content: string;
    previewText?: string;
  };
  onSend: (sendOptions: SendOptions) => Promise<void>;
}

interface SendOptions {
  recipientType: 'all' | 'segment' | 'custom';
  segmentIds?: string[];
  customEmails?: string[];
  testEmail?: string;
  sendTiming: 'immediate' | 'scheduled';
  scheduledDate?: Date;
  skipValidation?: boolean;
}

interface RecipientStats {
  total: number;
  active: number;
  segments: { id: string; name: string; count: number }[];
  recentEngagement: number;
}

export default function CampaignSendDialog({
  isOpen,
  onClose,
  campaign,
  onSend
}: CampaignSendDialogProps) {
  const [step, setStep] = useState<'recipients' | 'test' | 'confirm' | 'schedule'>('recipients');
  const [loading, setLoading] = useState(false);
  const [sendOptions, setSendOptions] = useState<SendOptions>({
    recipientType: 'all',
    sendTiming: 'immediate'
  });
  
  // Data states
  const [recipientStats, setRecipientStats] = useState<RecipientStats | null>(null);
  const [availableSegments, setAvailableSegments] = useState<Segment[]>([]);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Load initial data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadRecipientData();
      loadAvailableSegments();
      // Reset state
      setStep('recipients');
      setTestEmailSent(false);
      setSendOptions({
        recipientType: 'all',
        sendTiming: 'immediate'
      });
    }
  }, [isOpen]);

  const loadRecipientData = async () => {
    try {
      const response = await fetch('/api/email-marketing/v2?action=recipient_stats');
      const data = await response.json();
      if (data.success) {
        setRecipientStats(data.data);
      }
    } catch (error) {
      console.error('Error loading recipient stats:', error);
    }
  };

  const loadAvailableSegments = async () => {
    try {
      const response = await fetch('/api/email-marketing/v2?action=segments');
      const data = await response.json();
      if (data.success) {
        setAvailableSegments(data.data.segments || []);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/email-marketing/v2?action=send_test_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          test_email: testEmail.trim(),
          campaign_content: campaign.content
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestEmailSent(true);
        setTimeout(() => setStep('confirm'), 1000);
      } else {
        alert(`Error sending test email: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecipientCount = (): number => {
    if (!recipientStats) return 0;
    
    switch (sendOptions.recipientType) {
      case 'all':
        return recipientStats.active;
      case 'segment':
        if (!sendOptions.segmentIds) return 0;
        return sendOptions.segmentIds.reduce((total, segmentId) => {
          const segment = recipientStats.segments.find(s => s.id === segmentId);
          return total + (segment?.count || 0);
        }, 0);
      case 'custom':
        return sendOptions.customEmails?.length || 0;
      default:
        return 0;
    }
  };

  const handleFinalSend = async () => {
    const recipientCount = calculateRecipientCount();
    
    if (recipientCount === 0) {
      alert('No recipients selected. Please choose recipients before sending.');
      return;
    }

    // Final confirmation for large sends
    if (recipientCount > 1000) {
      const confirmed = confirm(
        `You are about to send "${campaign.name}" to ${recipientCount.toLocaleString()} recipients. ` +
        `This action cannot be undone. Are you sure you want to continue?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const finalOptions: SendOptions = {
        ...sendOptions,
        scheduledDate: sendOptions.sendTiming === 'scheduled' && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : undefined
      };

      await onSend(finalOptions);
      onClose();
    } catch (error) {
      console.error('Error sending campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'recipients', name: 'Recipients', icon: '👥' },
      { id: 'test', name: 'Test Email', icon: '🧪' },
      { id: 'confirm', name: 'Confirm', icon: '✅' }
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step === stepItem.id 
                ? 'bg-blue-500 text-white' 
                : steps.findIndex(s => s.id === step) > index
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {steps.findIndex(s => s.id === step) > index ? '✓' : stepItem.icon}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step === stepItem.id ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {stepItem.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                steps.findIndex(s => s.id === step) > index ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderRecipientsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
        
        {recipientStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{recipientStats.total.toLocaleString()}</div>
                <div className="text-sm text-blue-800">Total Contacts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{recipientStats.active.toLocaleString()}</div>
                <div className="text-sm text-green-800">Active Contacts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{recipientStats.segments.length}</div>
                <div className="text-sm text-purple-800">Segments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(recipientStats.recentEngagement)}%</div>
                <div className="text-sm text-orange-800">Recent Engagement</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* All Active Contacts */}
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="recipientType"
            value="all"
            checked={sendOptions.recipientType === 'all'}
            onChange={(e) => setSendOptions({...sendOptions, recipientType: e.target.value as any})}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">All Active Contacts</div>
            <div className="text-sm text-gray-600">
              Send to all {recipientStats?.active.toLocaleString() || 0} active contacts in your database
            </div>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {recipientStats?.active.toLocaleString() || 0}
          </div>
        </label>

        {/* Specific Segments */}
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="recipientType"
            value="segment"
            checked={sendOptions.recipientType === 'segment'}
            onChange={(e) => setSendOptions({...sendOptions, recipientType: e.target.value as any})}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Specific Segments</div>
            <div className="text-sm text-gray-600 mb-3">
              Choose one or more segments to target specific groups
            </div>
            
            {sendOptions.recipientType === 'segment' && (
              <div className="space-y-2 mt-3">
                {availableSegments.map((segment) => (
                  <label key={segment.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sendOptions.segmentIds?.includes(segment.id) || false}
                      onChange={(e) => {
                        const currentIds = sendOptions.segmentIds || [];
                        const newIds = e.target.checked
                          ? [...currentIds, segment.id]
                          : currentIds.filter(id => id !== segment.id);
                        setSendOptions({...sendOptions, segmentIds: newIds});
                      }}
                      className="rounded"
                    />
                    <span className="font-medium">{segment.name}</span>
                    <span className="text-gray-500">({segment.contactCount?.toLocaleString() || 0} contacts)</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-purple-600">
            {sendOptions.recipientType === 'segment' ? calculateRecipientCount().toLocaleString() : '0'}
          </div>
        </label>

        {/* Custom Email List */}
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="recipientType"
            value="custom"
            checked={sendOptions.recipientType === 'custom'}
            onChange={(e) => setSendOptions({...sendOptions, recipientType: e.target.value as any})}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Custom Email List</div>
            <div className="text-sm text-gray-600 mb-3">
              Enter specific email addresses (one per line)
            </div>
            
            {sendOptions.recipientType === 'custom' && (
              <textarea
                value={customEmailInput}
                onChange={(e) => {
                  setCustomEmailInput(e.target.value);
                  const emails = e.target.value.split('\n').filter(email => email.trim()).map(email => email.trim());
                  setSendOptions({...sendOptions, customEmails: emails});
                }}
                placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none"
              />
            )}
          </div>
          <div className="text-lg font-bold text-green-600">
            {sendOptions.recipientType === 'custom' ? calculateRecipientCount().toLocaleString() : '0'}
          </div>
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('test')}
          disabled={calculateRecipientCount() === 0}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Continue to Test Email ({calculateRecipientCount().toLocaleString()} recipients)
        </button>
      </div>
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Test Email</h3>
        <p className="text-gray-600 text-sm mb-4">
          It's recommended to send a test email before sending to all recipients to verify formatting and content.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 text-xl">⚠️</div>
          <div>
            <div className="font-medium text-yellow-800 mb-1">Important: Test Before Sending</div>
            <div className="text-sm text-yellow-700">
              Test emails help you verify that your campaign looks correct across different email clients and devices.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your email address to receive a test version of this campaign
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSendTestEmail}
            disabled={!testEmail.trim() || loading}
            className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending Test...
              </>
            ) : (
              <>
                🧪 Send Test Email
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            {showPreview ? 'Hide Preview' : '👁️ Preview'}
          </button>
        </div>

        {showPreview && (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Email Preview:</div>
            <div className="bg-white border rounded p-4 text-sm">
              <div className="font-bold text-lg mb-2">{campaign.subject}</div>
              {campaign.previewText && (
                <div className="text-gray-600 text-sm mb-4">{campaign.previewText}</div>
              )}
              <div dangerouslySetInnerHTML={{ __html: campaign.content.substring(0, 500) + '...' }} />
            </div>
          </div>
        )}

        {testEmailSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="text-green-600">✅</div>
              <div className="text-green-800 font-medium">Test email sent successfully!</div>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Check your inbox at {testEmail} to verify the campaign appearance.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep('recipients')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Back to Recipients
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('confirm')}
            className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Skip Test Email
          </button>
          <button
            onClick={() => setStep('confirm')}
            disabled={!testEmailSent}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Campaign Send</h3>
        <p className="text-gray-600 text-sm">
          Review your campaign details before sending. This action cannot be undone.
        </p>
      </div>

      {/* Campaign Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Campaign Name</div>
            <div className="text-lg font-bold text-gray-900">{campaign.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Subject Line</div>
            <div className="text-lg font-bold text-gray-900">{campaign.subject}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Recipients</div>
            <div className="text-lg font-bold text-blue-600">{calculateRecipientCount().toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Recipient Type</div>
            <div className="text-lg font-bold text-gray-900 capitalize">
              {sendOptions.recipientType === 'all' ? 'All Active Contacts' : 
               sendOptions.recipientType === 'segment' ? 'Selected Segments' : 'Custom List'}
            </div>
          </div>
        </div>

        {sendOptions.recipientType === 'segment' && sendOptions.segmentIds && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Segments</div>
            <div className="flex flex-wrap gap-2">
              {sendOptions.segmentIds.map(segmentId => {
                const segment = availableSegments.find(s => s.id === segmentId);
                return segment ? (
                  <span key={segmentId} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {segment.name} ({segment.contactCount?.toLocaleString() || 0})
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sending Options */}
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">When to Send</div>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="sendTiming"
                value="immediate"
                checked={sendOptions.sendTiming === 'immediate'}
                onChange={(e) => setSendOptions({...sendOptions, sendTiming: e.target.value as any})}
              />
              <div>
                <div className="font-medium">Send Immediately</div>
                <div className="text-sm text-gray-600">Campaign will be sent right away</div>
              </div>
            </label>
            
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="sendTiming"
                value="scheduled"
                checked={sendOptions.sendTiming === 'scheduled'}
                onChange={(e) => setSendOptions({...sendOptions, sendTiming: e.target.value as any})}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">Schedule for Later</div>
                <div className="text-sm text-gray-600 mb-2">Choose a specific date and time to send</div>
                
                {sendOptions.sendTiming === 'scheduled' && (
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="p-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Final Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-red-600 text-xl">🚨</div>
          <div>
            <div className="font-medium text-red-800 mb-1">Final Warning</div>
            <div className="text-sm text-red-700">
              You are about to send "{campaign.name}" to {calculateRecipientCount().toLocaleString()} recipients. 
              {sendOptions.sendTiming === 'scheduled' ? ` The campaign will be sent on ${scheduledDate} at ${scheduledTime}.` : ' The campaign will be sent immediately.'}
              {' '}This action cannot be undone.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep('test')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Back to Test
        </button>
        <button
          onClick={handleFinalSend}
          disabled={loading || (sendOptions.sendTiming === 'scheduled' && (!scheduledDate || !scheduledTime))}
          className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending Campaign...
            </>
          ) : (
            <>
              🚀 {sendOptions.sendTiming === 'scheduled' ? 'Schedule' : 'Send'} Campaign to {calculateRecipientCount().toLocaleString()} Recipients
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Send Campaign: {campaign.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {renderStepIndicator()}

          <div className="min-h-[500px]">
            {step === 'recipients' && renderRecipientsStep()}
            {step === 'test' && renderTestStep()}
            {step === 'confirm' && renderConfirmStep()}
          </div>
        </div>
      </div>
    </div>
  );
}