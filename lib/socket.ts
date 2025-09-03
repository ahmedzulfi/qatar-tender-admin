// lib/socket.ts
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private connected = false;

  // Initialize and connect the socket
  connect(token?: string): Socket {
    if (this.socket && this.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    const SOCKET_URL: string =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      this.connected = true;
    });

    this.socket.on("connect_error", (err: Error) => {
      console.error("❌ Socket connection error:", err.message);
      this.connected = false;
    });

    this.socket.on("disconnect", (reason: Socket.DisconnectReason) => {
      console.log("🔌 Socket disconnected:", reason);
      this.connected = false;
    });

    this.socket.on("pong", (data: any) => {
      console.log("🏓 Pong received:", data);
    });

    return this.socket;
  }

  // Join a specific user room
  joinUserRoom(userId: string): void {
    if (this.socket && this.connected) {
      console.log(`📡 Joining room for user: ${userId}`);
      this.socket.emit("join", userId);
    } else {
      console.warn("Cannot join room: Socket not connected");
    }
  }

  // Leave a specific user room
  leaveUserRoom(userId: string): void {
    if (this.socket && this.connected) {
      console.log(`🚪 Leaving room for user: ${userId}`);
      this.socket.emit("leave", userId);
    }
  }

  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      console.log("🔌 Socket manually disconnected");
    }
  }

  // Get the socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected;
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;
