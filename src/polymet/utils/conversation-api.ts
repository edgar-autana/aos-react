const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Log the API URL for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  message_order: number;
  tokens_used?: number;
  model_used?: string;
  processing_time_ms?: number;
  confidence_score?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  part_number_id: number;
  document_url: string;
  document_id?: string;
  title: string;
  session_id?: string;
  status: string;
  is_active_document: boolean;
  total_tokens: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  messages?: Message[];
}

export interface ConversationHistory {
  conversation_id: string;
  title: string;
  document_url: string;
  is_active_document: boolean;
  message_count: number;
  total_tokens: number;
  total_cost: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  document_type?: string;
  analysis_confidence?: number;
  materials_identified?: string[];
  processes_identified?: string[];
  cost_estimation?: {
    total_estimated_cost: number;
    currency: string;
    confidence_level: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PartHistoryResponse {
  success: boolean;
  part_number_id: number;
  analysis_history: ConversationHistory[];
  total_count: number;
  has_more: boolean;
  active_document_url?: string;
}

export interface ConversationResponse {
  success: boolean;
  conversation: Conversation;
}

export interface CreateConversationResponse {
  success: boolean;
  conversation: Conversation;
  initial_message_response?: {
    user_message: Message;
    ai_response: Message;
  };
}

export interface AddMessageResponse {
  success: boolean;
  message: Message;
  ai_response?: Message;
}

export class ConversationAPI {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }

  static async getPartHistory(
    partNumberId: string | number, 
    options: {
      limit?: number;
      offset?: number;
      includeArchived?: boolean;
    } = {}
  ): Promise<PartHistoryResponse> {
    const { limit = 20, offset = 0, includeArchived = false } = options;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      include_archived: includeArchived.toString()
    });

    const response = await fetch(
      `${API_BASE_URL}/conversations/part-number/${partNumberId}/history?${params}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return this.handleResponse<PartHistoryResponse>(response);
  }

  static async getConversation(conversationId: string): Promise<ConversationResponse> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return this.handleResponse<ConversationResponse>(response);
  }

  static async createConversation(data: {
    part_number_id: string | number;
    document_url: string;
    title: string;
    initial_message: string;
    is_active_document?: boolean;
    session_id?: string;
  }): Promise<CreateConversationResponse> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return this.handleResponse<CreateConversationResponse>(response);
  }

  static async addMessage(
    conversationId: string, 
    messageData: {
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<AddMessageResponse> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    return this.handleResponse<AddMessageResponse>(response);
  }
}

export const handleApiError = (error: unknown, context = ''): ApiResponse<null> => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error(`API Error ${context}:`, error);
  
  // You can integrate with your notification system here
  // toast.error(`Failed to ${context}: ${message}`);
  
  return {
    success: false,
    error: message
  };
};