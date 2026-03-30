package websocket

import (
	"encoding/json"
	"log/slog"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

// Event represents a WebSocket event pushed to the client.
type Event struct {
	EventType string      `json:"event"`
	TaskID    *string     `json:"task_id"`
	Payload   interface{} `json:"payload"`
}

// Hub manages all active WebSocket connections per user.
type Hub struct {
	mu          sync.RWMutex
	connections map[string]*websocket.Conn // userID → connection
}

// NewHub creates a new WebSocket hub.
func NewHub() *Hub {
	return &Hub{
		connections: make(map[string]*websocket.Conn),
	}
}

// Register adds a user's WebSocket connection.
func (h *Hub) Register(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Close existing connection if any (one connection per user)
	if existing, ok := h.connections[userID]; ok {
		existing.Close()
	}

	h.connections[userID] = conn
	slog.Info("WebSocket client connected", "user_id", userID)
}

// Unregister removes a user's WebSocket connection.
func (h *Hub) Unregister(userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if conn, ok := h.connections[userID]; ok {
		conn.Close()
		delete(h.connections, userID)
		slog.Info("WebSocket client disconnected", "user_id", userID)
	}
}

// SendToUser sends an event to a specific user's WebSocket connection.
func (h *Hub) SendToUser(userID string, event Event) error {
	h.mu.RLock()
	conn, ok := h.connections[userID]
	h.mu.RUnlock()

	if !ok {
		return nil // user not connected, skip silently
	}

	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return conn.WriteMessage(websocket.TextMessage, data)
}

// Broadcast sends an event to all connected users.
func (h *Hub) Broadcast(event Event) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	data, err := json.Marshal(event)
	if err != nil {
		slog.Error("failed to marshal broadcast event", "error", err)
		return
	}

	for userID, conn := range h.connections {
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			slog.Error("failed to send broadcast to user", "user_id", userID, "error", err)
		}
	}
}

// ConnectedUsers returns the count of connected users.
func (h *Hub) ConnectedUsers() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.connections)
}
