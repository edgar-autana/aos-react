import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SendIcon, BotIcon, UserIcon, ImageIcon, XIcon, FileTextIcon, Loader2Icon } from "lucide-react";
import TypingIndicator from './typing-indicator';
import VisualMessage from './visual-message';
import { conversationService, Conversation, Message } from '../../services/conversation-service';
import { handleApiError } from '../../utils/conversation-api';

interface SelectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  imageData?: string;
}

interface AIAssistantChatProps {
  partNumber: {
    id: string;
    part_drawing_2d: string | null;
    part_name?: string | null;
    drawing_number?: string | null;
  };
  selectedRegion: SelectedRegion | null;
  regionSnapshot: string | null;
  onClearSelection: () => void;
  conversationId?: string | null;
  onConversationChange?: (conversationId: string) => void;
  loading?: boolean;
  selectedModel?: string;
}

export default function AIAssistantChat({
  partNumber,
  selectedRegion,
  regionSnapshot,
  onClearSelection,
  conversationId,
  onConversationChange,
  loading: externalLoading = false,
  selectedModel = 'gpt-4o'
}: AIAssistantChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversation when conversationId changes
  useEffect(() => {
    let isMounted = true;

    const loadConversationSafely = async (id: string) => {
      try {
        setInternalLoading(true);
        setError(null);
        const response = await conversationService.getConversation(id);
        
        if (!isMounted) return;
        
        if (response.success && response.conversation) {
          setConversation(response.conversation);
          setMessages(response.conversation.messages || []);
        } else {
          setError('Failed to load conversation');
          console.error('Failed to load conversation:', response.error);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load conversation:', error);
          setError('Failed to load conversation');
          handleApiError(error, 'load conversation');
        }
      } finally {
        if (isMounted) {
          setInternalLoading(false);
        }
      }
    };

    if (conversationId) {
      loadConversationSafely(conversationId);
    } else {
      setMessages([]);
      setConversation(null);
      setError(null);
    }

    return () => {
      isMounted = false;
    };
  }, [conversationId]);



  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    // Check if region is required but not available
    if (selectedRegion && !regionSnapshot) {
      setError('Please capture the region before sending the message');
      return;
    }

    // Prepare metadata with region information for the user message
    const messageMetadata: Record<string, any> = { 
      timestamp: new Date().toISOString(),
      hasSelectedRegion: !!selectedRegion,
      regionSnapshot: !!regionSnapshot
    };

    // If there's a region selected and captured, include it in the metadata
    if (selectedRegion && regionSnapshot) {
      messageMetadata.selectedRegion = {
        coordinates: {
          x: selectedRegion.x,
          y: selectedRegion.y,
          width: selectedRegion.width,
          height: selectedRegion.height,
          page: selectedRegion.page
        },
        imageData: regionSnapshot
      };
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation?.id || '',
      role: 'user',
      content: messageContent,
      message_order: messages.length + 1,
      model: selectedModel,
      created_at: new Date().toISOString(),
      metadata: messageMetadata
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      let response;

      if (conversation?.id) {
        // Continue existing conversation
        if (selectedRegion && regionSnapshot) {
          // Use the new method for region-based messages
          response = await conversationService.addMessageWithRegion(conversation.id, {
            role: 'user',
            content: messageContent,
            model: selectedModel,
            regionData: {
              coordinates: {
                x: selectedRegion.x,
                y: selectedRegion.y,
                width: selectedRegion.width,
                height: selectedRegion.height,
                page: selectedRegion.page
              },
              imageData: regionSnapshot
            },
            metadata: messageMetadata
          });
        } else {
          // Use regular message method
          response = await conversationService.addMessage(conversation.id, {
            role: 'user',
            content: messageContent,
            model: selectedModel,
            metadata: messageMetadata
          });
        }
      } else {
        // For new conversations, we need to handle region data differently
        // since createConversation doesn't support metadata directly
        response = await conversationService.createConversation({
          part_number_id: partNumber.id,
          document_url: selectedRegion && regionSnapshot ? 'region_selected' : (partNumber.part_drawing_2d || ''),
          title: `Analysis - ${partNumber.part_name || partNumber.drawing_number || `Part ${partNumber.id}`}`,
          initial_message: messageContent,
          is_active_document: true
        });

        // If we created a conversation with region data, we need to add the metadata
        // in a follow-up message update (this would need backend support)
        if (response.success && selectedRegion && regionSnapshot) {
          // For now, we'll handle this in the conversation creation
          // The backend should be updated to handle region data in initial messages
        }
      }

      if (response.success) {
        // Clear region selection after successful message send
        if (selectedRegion) {
          onClearSelection();
        }
        
        if (!conversation?.id) {
          // New conversation created
          if ('conversation' in response && response.conversation) {
            setConversation(response.conversation);
            onConversationChange?.(response.conversation.id);
            
            // Add both user message and AI response from initial creation
            if ('initial_message_response' in response && response.initial_message_response) {
              setMessages([
                response.initial_message_response.user_message,
                response.initial_message_response.ai_response
              ]);
            }
          }
        } else {
          // Message added to existing conversation
          if ('ai_response' in response && response.ai_response) {
            setMessages(prev => {
              // Replace temp user message with real one and add AI response
              const withoutTemp = prev.slice(0, -1);
              return [...withoutTemp, response.message!, response.ai_response!];
            });
          }
        }
      } else {
        // Remove the temporary user message if sending failed
        setMessages(prev => prev.slice(0, -1));
        setError('Failed to send message');
        console.error('Failed to send message:', response.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary user message if sending failed
      setMessages(prev => prev.slice(0, -1));
      setError('Failed to send message');
      handleApiError(error, 'send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Don't allow sending if region is selected but not captured
    if (selectedRegion && !regionSnapshot) {
      setError('Please capture the region before sending the message');
      return;
    }
    
    sendMessage(inputValue.trim());
  };

  const clearMessages = () => {
    setMessages([]);
    setConversation(null);
    setError(null);
    onConversationChange?.('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter messages by selected model
  const filteredMessages = messages.filter(message => {
    // For both user and assistant messages, check if model matches
    const messageModel = message.model || message.model_used || 'gpt-4o'; // Default to gpt-4o if null
    return messageModel === selectedModel;
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [filteredMessages, isTyping]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header with context info */}
      {conversation && (
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {conversation.title || 'Untitled Conversation'}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <FileTextIcon className="w-4 h-4 mr-1" />
                <span>Part {conversation.part_number_id || 'Unknown'}</span>
                {conversation.is_active_document && (
                  <Badge className="ml-2 text-xs text-green-600 bg-green-50">
                    Active Document
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>{conversation.total_tokens || 0} tokens</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Original header for non-conversation mode */}
      {!conversation && (
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                <BotIcon className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">AI Assistant</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedRegion && (
              <Badge variant="secondary" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                Region Selected
                <button
                  onClick={onClearSelection}
                  className="ml-2 hover:text-destructive"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {partNumber.drawing_number && (
              <Badge variant="outline" className="text-xs">
                {partNumber.drawing_number}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 min-h-0">
        {externalLoading || internalLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2Icon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Loading conversation...</p>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500">
            <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation about this document</p>
            <p className="text-sm">Ask questions about materials, processes, costs, or specifications</p>
          </div>
        ) : (
          // Render conversation messages with VisualMessage
          <div className="space-y-2">
            {filteredMessages.map((message, index) => (
              <div key={message.id || index}>
                <VisualMessage
                  content={message.content}
                  role={message.role}
                  model={message.model || message.model_used}
                  metadata={message.metadata}
                />
                <div className={`text-xs px-3 ${
                  message.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-500 ml-11'
                }`}>
                  {formatTimestamp(message.created_at)}
                  {typeof message.tokens_used === 'number' && (
                    <span className="ml-2">• {message.tokens_used} tokens</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {isTyping && <TypingIndicator />}
      </ScrollArea>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t-2 bg-white shadow-sm">
        {/* Region status indicator */}
        {selectedRegion && (
          <div className={`mb-3 p-3 rounded-lg border text-sm ${
            regionSnapshot 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center gap-3">
              {regionSnapshot ? (
                <div className="flex items-center gap-3">
                  {/* Thumbnail of captured region */}
                  <div className="flex-shrink-0 relative">
                    <img 
                      src={regionSnapshot.startsWith('data:') ? regionSnapshot : `data:image/png;base64,${regionSnapshot}`} 
                      alt="Captured region" 
                      className="w-12 h-12 object-cover rounded border border-green-300 shadow-sm"
                      onError={(e) => {
                        console.error('Failed to load region thumbnail:', e);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        // Show fallback icon
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback icon - only shows if image fails to load */}
                    <div 
                      className="w-12 h-12 bg-green-100 border border-green-300 rounded flex items-center justify-center shadow-sm"
                      style={{ display: 'none' }}
                    >
                      <ImageIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">✅ Region captured - ready to analyze</span>
                    </div>
                    <span className="text-xs text-green-600 mt-1">
                      {selectedRegion.width}×{selectedRegion.height}px at ({selectedRegion.x}, {selectedRegion.y})
                    </span>
                  </div>
                  <button
                    onClick={onClearSelection}
                    className="ml-auto p-1 hover:bg-green-100 rounded transition-colors"
                    title="Clear region selection"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>⚠️ Region selected - click "Capture" to proceed</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedRegion 
                ? (regionSnapshot ? "Ask about the selected region..." : "Capture the region first...") 
                : "Ask about the technical drawing..."
            }
            className="flex-1 border-2 focus:border-blue-500"
            disabled={isTyping || externalLoading || internalLoading || (selectedRegion && !regionSnapshot)}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={
              !inputValue.trim() || 
              isTyping || 
              externalLoading || 
              internalLoading || 
              (selectedRegion && !regionSnapshot)
            }
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
        
        {filteredMessages.length > 0 && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-xs text-muted-foreground"
            >
              Clear conversation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}