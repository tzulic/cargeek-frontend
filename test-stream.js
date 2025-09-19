// Test script to check SSE events
const testStream = async () => {
  console.log('Testing SSE stream...');
  
  const response = await fetch('http://localhost:3000/api/cargeek-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: { parts: [{ type: 'text', text: 'test' }] },
      session_id: 'test-123'
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    console.log('Received chunk:', text);
  }
};

testStream().catch(console.error);
