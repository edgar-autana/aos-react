import { useState, useCallback } from 'react';
import { conversationService, Conversation, Message, ConversationHistory } from '../services/conversation-service';
import { handleApiError } from '../utils/conversation-api';

interface UseConversationReturn {
  // State
  conversation: Conversation | null;
  messages: Message[];
  history: ConversationHistory[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadConversation: (conversationId: string) => Promise<void>;
  loadPartHistory: (partNumberId: string) => Promise<void>;
  sendMessage: (content: string, metadata?: Record<string, any>) => Promise<void>;
  createNewConversation: (data: {
    part_number_id: string | number;
    document_url: string;
    title: string;
    initial_message: string;
    is_active_document?: boolean;
  }) => Promise<void>;
  clearConversation: () => void;
  clearError: () => void;
}

export function useConversation(): UseConversationReturn {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await conversationService.getConversation(conversationId);
      
      if (response.success && response.conversation) {
        setConversation(response.conversation);
        setMessages(response.conversation.messages || []);
      } else {
        setError('Failed to load conversation');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation');
      handleApiError(error, 'load conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPartHistory = useCallback(async (partNumberId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await conversationService.getPartHistory(partNumberId, {
        limit: 20,
        offset: 0,
        includeArchived: false
      });
      
      if (response.success) {
        setHistory(response.analysis_history);
      } else {
        setError('Failed to load history');
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load history');
      handleApiError(error, 'load history');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, metadata?: Record<string, any>) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation?.id || '',
      role: 'user',
      content: content,
      message_order: messages.length + 1,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);

    try {
      let response;
      
      if (conversation?.id) {
        // Continue existing conversation
        response = await conversationService.addMessage(conversation.id, {
          role: 'user',
          content: content,
          metadata: metadata || {}
        });
      } else {
        throw new Error('No active conversation to send message to');
      }

      if (response.success) {
        if ('ai_response' in response && response.ai_response) {
          setMessages(prev => {
            // Replace temp user message with real one and add AI response
            const withoutTemp = prev.slice(0, -1);
            return [...withoutTemp, response.message!, response.ai_response!];
          });
        }
      } else {
        // Remove the temporary user message if sending failed
        setMessages(prev => prev.slice(0, -1));
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary user message if sending failed
      setMessages(prev => prev.slice(0, -1));
      setError('Failed to send message');
      handleApiError(error, 'send message');
    }
  }, [conversation, messages]);

  const createNewConversation = useCallback(async (data: {
    part_number_id: string | number;
    document_url: string;
    title: string;
    initial_message: string;
    is_active_document?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await conversationService.createConversation(data);
      
      if (response.success) {
        if ('conversation' in response && response.conversation) {
          setConversation(response.conversation);
          
          // Add both user message and AI response from initial creation
          if ('initial_message_response' in response && response.initial_message_response) {
            setMessages([
              response.initial_message_response.user_message,
              response.initial_message_response.ai_response
            ]);
          }
        }
      } else {
        setError('Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError('Failed to create conversation');
      handleApiError(error, 'create conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    // State
    conversation,
    messages,
    history,
    loading,
    error,
    
    // Actions
    loadConversation,
    loadPartHistory,
    sendMessage,
    createNewConversation,
    clearConversation,
    clearError
  };
} 