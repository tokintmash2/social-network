export const initializeWebSocket = () => {
  const ws = new WebSocket("ws://localhost:8080/ws");

  ws.onopen = () => {
    console.log("Connected to WebSocket");
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("Received message:", message);
  };

  ws.onerror = (error) => {
    console.log("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };

  return ws;
};
