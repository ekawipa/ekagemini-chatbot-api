const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
/**
 * Appends a new message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The message content.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Show a temporary "Thinking..." message and get a reference to it
  const thinkingMessage = appendMessage('bot', 'Gemini Ai Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      let errorText = 'Failed to get response from server.';
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorText = `Error: ${errorData.error}`;
        }
      } catch (jsonError) {
        // The response body was not JSON. Use the default error message.
        console.error('Could not parse error response as JSON:', jsonError);
      }
      throw new Error(errorText);
    }

    const data = await response.json();

    // The backend API returns the response in the `output` property.
    if (data.output) {
      thinkingMessage.textContent = data.output;
    } else {
      thinkingMessage.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    thinkingMessage.textContent = error.message || 'Failed to get response from server.';
  }
});
