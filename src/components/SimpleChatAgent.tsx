'use client';

import { useState } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SimpleChatAgent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        style={{ zIndex: 9999 }}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
        
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-lg shadow-xl border">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Chat de Atendimento</h3>
            <p className="text-sm opacity-90">Como posso ajudar?</p>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            <div className="text-gray-500 text-center">
              Chat simplificado funcionando!
            </div>
          </div>
          
          <div className="p-4 border-t">
            <input 
              type="text" 
              placeholder="Digite sua mensagem..."
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}