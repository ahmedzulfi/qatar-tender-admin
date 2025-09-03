// services/chatService.ts
import { api } from "@/lib/apiClient";

export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: string;
  text?: string;
  media?: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatRoom {
  title: string;
  id(id: any): unknown;
  _id: string;
  tenderId?: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  roomId: string;
  messages: ChatMessage[];
  hasMore: boolean;
}

/**
 * Fetch all chat rooms for the logged-in user
 * @returns List of enriched chat rooms
 */
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const res = await api.get<ChatRoom[]>("/api/chat/rooms");
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching chat rooms:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetch messages from a specific chat room
 */
export const getChatMessages = async (
  roomId: string,
  options: { limit?: number; lastMessageId?: string } = {}
): Promise<MessageResponse> => {
  try {
    const res = await api.get<MessageResponse>(
      `/api/chat/rooms/${roomId}/messages`,
      { params: options }
    );
    return res.data;
  } catch (error: any) {
    console.error(
      `Error fetching messages for room ${roomId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Send a message to a chat room (with optional media)
 */
export const sendMessage = async (
  roomId: string,
  payload: { text?: string; media?: string }
): Promise<ChatMessage> => {
  try {
    const res = await api.post<ChatMessage>(
      `/api/chat/rooms/${roomId}/messages`,
      payload
    );
    return res.data;
  } catch (error: any) {
    console.error(
      `Error sending message to room ${roomId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Mark messages in a chat room as read
 */
export const markMessagesAsRead = async (
  roomId: string
): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(
      `/api/chat/rooms/${roomId}/mark-read`
    );
    return res.data;
  } catch (error: any) {
    console.error(
      `Error marking messages as read in room ${roomId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get chat room by tender ID (useful to redirect to chat from tender page)
 */
export const getChatRoomByTenderId = async (
  tenderId: string
): Promise<ChatRoom> => {
  try {
    const res = await api.get<ChatRoom>(`/api/chat/tender/${tenderId}`);
    return res.data;
  } catch (error: any) {
    console.error(
      `Error getting chat room for tender ${tenderId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Create a new chat room (optional: only if not auto-created on award)
 */
// export const createChatRoom = async (
//   tenderId: string,
//   participant1Id: string,
//   participant2Id: string,
//   title: string
// ): Promise<ChatRoom> => {
//   try {
//     const res = await api.post<ChatRoom>("/api/chat/create", {
//       tenderId,
//       participant1Id,
//       participant2Id,
//       title,
//     });
//     return res.data;
//   } catch (error: any) {
//     console.error(
//       "Error creating chat room:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };
