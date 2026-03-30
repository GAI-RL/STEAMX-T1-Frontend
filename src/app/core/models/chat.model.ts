// Figure/image data for assistant responses
export interface ChatFigure {
  image_path?: string;
  caption?: string;
  image_base64?: string;
  imageUrl?: string;
}

// A chat conversation
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];  // Add this optional field for frontend use
}

// A single message in chat
export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  figures?: ChatFigure[];   // ✅ added (for images)
}

// When user sends a message
export interface SendMessageRequest {
  session_id: string;
  question: string;
}

// Backend's response
export interface SendMessageResponse {
  question: string;
  answer: string;
  session_id: string;
  figures?: ChatFigure[];   // ✅ added (for images)
}

// Alias for compatibility (so we don't have to change everything)
export type Message = ChatMessage;