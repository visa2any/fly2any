'use client';

export default function TestChat() {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button 
        className="bg-red-500 text-white p-4 rounded-full shadow-lg"
        onClick={() => alert('Chat teste funcionando!')}
      >
        TESTE
      </button>
    </div>
  );
}