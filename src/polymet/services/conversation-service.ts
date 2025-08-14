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
    model?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AddMessageResponse>;
  
  addMessageWithRegion(conversationId: string, messageData: {
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    regionData?: {
      coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
        page: number;
      };
      imageData: string;
    };
    metadata?: Record<string, unknown>;
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
      model?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<AddMessageResponse> {
    try {
      return await ConversationAPI.addMessage(conversationId, messageData);
    } catch (error) {
      console.error('ConversationService: Failed to add message:', error);
      throw error;
    }
  }

  async addMessageWithRegion(
    conversationId: string, 
    messageData: {
      role: 'user' | 'assistant';
      content: string;
      model?: string;
      regionData?: {
        coordinates: {
          x: number;
          y: number;
          width: number;
          height: number;
          page: number;
        };
        imageData: string;
      };
      metadata?: Record<string, unknown>;
    }
  ): Promise<AddMessageResponse> {
    try {
      // Prepare enhanced metadata with region information
      const enhancedMetadata = {
        ...messageData.metadata,
        hasRegionData: !!messageData.regionData,
        regionCoordinates: messageData.regionData?.coordinates,
        regionImageData: messageData.regionData?.imageData
      };

      return await ConversationAPI.addMessage(conversationId, {
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        metadata: enhancedMetadata
      });
    } catch (error) {
      console.error('ConversationService: Failed to add message with region:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const conversationService = new ConversationService();

// Export types for convenience
export type { Conversation, Message, ConversationHistory }; 