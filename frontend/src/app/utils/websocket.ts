export const initializeWebSocket = () => {
	const ws = new WebSocket('ws://localhost:8080/ws')

	ws.onopen = () => {
		console.log('Connected to WebSocket')
		// Send authentication message after connection if needed
		ws.send(JSON.stringify({ type: 'auth', token: 'your-auth-token' }))
	}

	ws.onmessage = (event) => {
		const message = JSON.parse(event.data)
		// Handle different message types
		switch (message.type) {
			case 'chat':
				console.log('Chat message:', message.content)
				break
			case 'notification':
				console.log('Notification:', message.content)
				break
			default:
				console.log('Received message:', message)
		}
	}

	ws.onerror = (error) => {
		console.log('WebSocket error:', error)
	}

	ws.onclose = () => {
		console.log('WebSocket connection closed')
		// Implement reconnection logic if needed
	}

	return ws
}
