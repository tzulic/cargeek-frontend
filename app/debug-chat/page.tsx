'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';

export default function DebugChat() {
  const [rawEvents, setRawEvents] = useState<string[]>([]);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    reload,
    stop,
  } = useChat({
    api: '/api/cargeek-stream',
    onResponse: (response) => {
      console.log('onResponse:', response);
      setRawEvents(prev => [...prev, `Response: ${response.status} ${response.statusText}`]);
    },
    onFinish: (message) => {
      console.log('onFinish:', message);
      setRawEvents(prev => [...prev, `Finished: ${JSON.stringify(message)}`]);
    },
    onError: (error) => {
      console.error('onError:', error);
      setRawEvents(prev => [...prev, `Error: ${error}`]);
    },
  });

  // Log all state changes
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat Debug Interface</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Chat Interface */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          
          <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto mb-4">
            {messages.length === 0 && (
              <p className="text-gray-500">No messages yet...</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`mb-2 p-2 rounded ${
                m.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <strong>{m.role}:</strong>
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(m.content, null, 2)}</pre>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
            {isLoading && (
              <button
                onClick={stop}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Stop
              </button>
            )}
          </form>

          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              Error: {error.message}
            </div>
          )}
        </div>

        {/* Right: Debug Info */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold">Status:</h3>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Message Count: {messages.length}</p>
            <p>Error: {error ? error.message : 'None'}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Raw Events:</h3>
            <div className="bg-gray-100 p-2 rounded h-64 overflow-y-auto">
              {rawEvents.map((event, i) => (
                <pre key={i} className="text-xs mb-1">{event}</pre>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Messages State:</h3>
            <div className="bg-gray-100 p-2 rounded h-64 overflow-y-auto">
              <pre className="text-xs">{JSON.stringify(messages, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}