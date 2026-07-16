const messages = [];

export function saveMessage(message) {
  messages.push({
    ...message,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });

  return messages[messages.length - 1];
}

export function getMessages() {
  return [...messages];
}
