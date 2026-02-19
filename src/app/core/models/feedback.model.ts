// User submits feedback
export interface Feedback {
  rating: number;
  comment: string;
}

// Backend confirms receipt
export interface FeedbackResponse {
  message: string;
}