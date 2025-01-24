async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  const chatHistory = document.getElementById('chat-history');

  if (!message) return;

  // Add user message to history
  chatHistory.innerHTML += `
    <div class="message user-message">
      <strong>You:</strong> ${message}
    </div>
  `;

  // Disable input while processing
  input.disabled = true;

  try {
    const response = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      })
    });

    // Check if response is OK and has content
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Invalid response from server');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const botResponse = data.choices[0].message.content;

    chatHistory.innerHTML += `
      <div class="message bot-message">
        <strong>Bot:</strong> ${botResponse}
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    chatHistory.innerHTML += `
      <div class="message bot-message error">
        <strong>Error:</strong> ${error.message}
      </div>
    `;
  } finally {
    // Re-enable input
    input.disabled = false;
    input.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;
    input.focus();
  }
}

// Event listeners
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
