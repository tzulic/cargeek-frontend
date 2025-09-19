'use client';

import { useState } from 'react';

export default function TestStreaming() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const testStreaming = async () => {
    setIsStreaming(true);
    setMessages(prev => [...prev, '--- Starting test ---']);
    
    try {
      const response = await fetch('/api/cargeek-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input || 'Hello, what is a Ferrari?',
          session_id: 'test-' + Date.now(),
        }),
      });

      if (!response.ok) {
        setMessages(prev => [...prev, `Error: ${response.status} ${response.statusText}`]);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setMessages(prev => [...prev, 'No reader available']);
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        setMessages(prev => [...prev, chunk]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, `Error: ${error}`]);
    } finally {
      setIsStreaming(false);
      setMessages(prev => [...prev, '--- Test complete ---']);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SSE Streaming Test</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter message (or leave empty for default)"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={testStreaming}
        disabled={isStreaming}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {isStreaming ? 'Streaming...' : 'Test Streaming'}
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Raw SSE Events:</h2>
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <pre key={i} className="text-xs mb-2 whitespace-pre-wrap">{msg}</pre>
          ))}
        </div>
      </div>
    </div>
  );
}