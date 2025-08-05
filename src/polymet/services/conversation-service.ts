import { ConversationAPI, Conversation, Message, ConversationHistory, PartHistoryResponse, ConversationResponse, CreateConversationResponse, AddMessageResponse } from '../utils/conversation-api';

export interface ConversationServiceInterface {
  getPartHistory(partNumberId: string, options?: {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<PartHistoryResponse>;
  
  getConversation(conversationId: string): Promise<ConversationResponse>;
  
  createConversation(data: {
    part_number_id: string | number;
    document_url: string;
    title: string;
    initial_message: string;
    is_active_document?: boolean;
    session_id?: string;
  }): Promise<CreateConversationResponse>;
  
  addMessage(conversationId: string, messageData: {
    role: 'user' | 'assistant';
    content: string;
    metadata?: Record<string, any>;
  }): Promise<AddMessageResponse>;
}

export class ConversationService implements ConversationServiceInterface {
  async getPartHistory(
    partNumberId: string, 
    options: {
      limit?: number;
      offset?: number;
      includeArchived?: boolean;
    } = {}
  ): Promise<PartHistoryResponse> {
    try {
      return await ConversationAPI.getPartHistory(partNumberId, options);
    } catch (error) {
      console.error('ConversationService: Failed to get part history:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    try {
      return await ConversationAPI.getConversation(conversationId);
    } catch (error) {
      console.error('ConversationService: Failed to get conversation:', error);
      throw error;
    }
  }

  async createConversation(data: {
    part_number_id: string | number;
    document_url: string;
    title: string;
    initial_message: string;
    is_active_document?: boolean;
    session_id?: string;
  }): Promise<CreateConversationResponse> {
    try {
      return await ConversationAPI.createConversation(data);
    } catch (error) {
      console.error('ConversationService: Failed to create conversation:', error);
      throw error;
    }
  }

  async addMessage(
    conversationId: string, 
    messageData: {
      role: 'user' | 'assistant';
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<AddMessageResponse> {
    try {
      return await ConversationAPI.addMessage(conversationId, messageData);
    } catch (error) {
      console.error('ConversationService: Failed to add message:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const conversationService = new ConversationService();

// Export types for convenience
export type { Conversation, Message, ConversationHistory }; 