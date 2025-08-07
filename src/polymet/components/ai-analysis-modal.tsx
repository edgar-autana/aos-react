import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XIcon, BrainIcon, HistoryIcon, CpuIcon } from "lucide-react";
import AIAnalysisTab from './ai-analysis-tab';
import { conversationService, ConversationHistory } from '../services/conversation-service';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  partNumber: {
    id: string;
    part_drawing_2d: string | null;
    part_name?: string | null;
    drawing_number?: string | null;
  };
  // onPartNumberUpdate?: () => void; // DISABLED to prevent infinite loop
}

export default function AIAnalysisModal({
  isOpen,
  onClose,
  partNumber
}: AIAnalysisModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [refreshedPartNumber, setRefreshedPartNumber] = useState(partNumber);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  // const hasRefreshedRef = useRef(false); // DISABLED since refresh is disabled

  const handleClose = useCallback(() => {
    console.log('🔄 AIAnalysisModal handleClose called');
    setIsClosing(true);
    setTimeout(() => {
      console.log('🔄 AIAnalysisModal calling onClose');
      onClose();
      setIsClosing(false);
    }, 150);
  }, [onClose]);

  // Refresh part number data when modal opens - DISABLED to prevent infinite loop
  // useEffect(() => {
  //   console.log('🔍 AIAnalysisModal useEffect - isOpen:', isOpen, 'hasRefreshed:', hasRefreshedRef.current, 'onPartNumberUpdate exists:', !!onPartNumberUpdate);
  //   if (isOpen && onPartNumberUpdate && !hasRefreshedRef.current) {
  //     console.log('🔄 AIAnalysisModal calling onPartNumberUpdate');
  //     // Call the callback immediately to refresh part number data
  //     onPartNumberUpdate();
  //     hasRefreshedRef.current = true;
  //     console.log('✅ AIAnalysisModal set hasRefreshed to true');
  //   }
  // }, [isOpen, onPartNumberUpdate]); // Include onPartNumberUpdate to ensure it's stable

  // Reset refresh flag when modal closes - DISABLED since refresh is disabled
  // useEffect(() => {
  //   console.log('🔄 AIAnalysisModal reset useEffect - isOpen:', isOpen);
  //   if (!isOpen) {
  //     hasRefreshedRef.current = false;
  //     console.log('✅ AIAnalysisModal reset hasRefreshed to false');
  //   }
  // }, [isOpen]);

  // Update refreshed part number when prop changes
  useEffect(() => {
    console.log('🔄 AIAnalysisModal partNumber useEffect - partNumber.id:', partNumber.id, 'partNumber.part_drawing_2d:', !!partNumber.part_drawing_2d);
    setRefreshedPartNumber(partNumber);
    // Reset to original document when part number changes
    setCurrentDocumentUrl(partNumber.part_drawing_2d);
  }, [partNumber]);

  // Load conversation history when modal opens
  useEffect(() => {
    console.log('🔍 Modal useEffect - isOpen:', isOpen, 'partNumber.id:', partNumber.id, 'part_drawing_2d:', !!partNumber.part_drawing_2d);
    if (isOpen && partNumber.id) {
      loadConversationHistory();
    }
  }, [isOpen, partNumber.id]);

  const loadConversationHistory = async () => {
    console.log('🔍 Loading conversation history for part:', partNumber.id);
    setLoadingHistory(true);
    try {
      const response = await conversationService.getPartHistory(partNumber.id, {
        limit: 50,
        offset: 0,
        includeArchived: false
      });
      
      console.log('🔍 History response:', response.success, 'count:', response.analysis_history?.length || 0);
      
      if (response.success) {
        setConversationHistory(response.analysis_history);
        // Set the most recent (first) conversation as current, or null if none
        if (response.analysis_history.length > 0) {
          console.log('✅ Found existing history, using first conversation');
          setCurrentConversationId(response.analysis_history[0].conversation_id);
          setCurrentDocumentUrl(response.analysis_history[0].document_url);
        } else {
          console.log('🔍 No history found. Document exists:', !!partNumber.part_drawing_2d);
          // No history exists, create initial conversation if there's a document
          if (partNumber.part_drawing_2d) {
            console.log('🔄 Creating initial conversation...');
            await createInitialConversation();
          } else {
            console.log('❌ No document, skipping conversation creation');
            setCurrentConversationId(null);
            setCurrentDocumentUrl(null);
          }
        }
      } else {
        console.error('❌ Failed to get history response:', response);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const createInitialConversation = async () => {
    try {
      console.log('🔄 Creating initial conversation for part:', partNumber.id);
      console.log('🔍 Document URL:', partNumber.part_drawing_2d);
      
      const conversationData = {
        part_number_id: partNumber.id,
        document_url: partNumber.part_drawing_2d || '',
        title: `Initial Analysis - ${partNumber.part_name || partNumber.drawing_number || `Part ${partNumber.id}`}`,
        initial_message: "",
        is_active_document: true,
        session_id: `init_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      console.log('🔍 Conversation data:', conversationData);
      
      const response = await conversationService.createConversation(conversationData);
      
      console.log('🔍 Create conversation response:', response.success, response.conversation?.id);

      if (response.success && response.conversation) {
        console.log('✅ Initial conversation created:', response.conversation.id);
        
        // Update states with the new conversation
        setCurrentConversationId(response.conversation.id);
        setCurrentDocumentUrl(response.conversation.document_url);
        
        console.log('🔄 Reloading history after creating conversation...');
        
        // Reload history to include the new conversation
        const historyResponse = await conversationService.getPartHistory(partNumber.id, {
          limit: 50,
          offset: 0,
          includeArchived: false
        });
        
        console.log('🔍 History after create:', historyResponse.success, historyResponse.analysis_history?.length || 0);
        
        if (historyResponse.success) {
          setConversationHistory(historyResponse.analysis_history);
        }
      } else {
        console.error('❌ Failed to create conversation:', response);
      }
    } catch (error) {
      console.error('❌ Exception creating initial conversation:', error);
      // Fallback to no conversation state
      setCurrentConversationId(null);
      setCurrentDocumentUrl(partNumber.part_drawing_2d);
    }
  };

  const handleConversationChange = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    
    // Find the selected conversation and update the document URL
    const selectedConversation = conversationHistory.find(conv => conv.conversation_id === conversationId);
    if (selectedConversation) {
      setCurrentDocumentUrl(selectedConversation.document_url);
    }
  };

  const handleNewConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Reload history to include the new conversation
    loadConversationHistory();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const partDisplayName = refreshedPartNumber.part_name || refreshedPartNumber.drawing_number || `PN-${refreshedPartNumber.id.slice(-6)}`;


  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className={`
          max-w-[98vw] sm:max-w-[95vw] w-full 
          h-[98vh] sm:h-[95vh] max-h-[98vh] sm:max-h-[95vh] 
          p-0 gap-0 
          transition-all duration-200 ease-in-out
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          [&>button]:hidden
        `}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Hidden description for screen readers */}
        <DialogDescription className="sr-only">
          AI Technical Analysis modal for {partDisplayName}. Use the PDF viewer to analyze drawings and chat with AI assistant for technical insights.
        </DialogDescription>
        {/* Custom Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 relative z-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BrainIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                AI Technical Analysis
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {partDisplayName}
                {refreshedPartNumber.drawing_number && refreshedPartNumber.drawing_number !== partDisplayName && (
                  <span className="ml-2">• {refreshedPartNumber.drawing_number}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* History dropdown - Always show */}
            <div className="flex items-center gap-2 relative z-50">
              <HistoryIcon className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={currentConversationId || ""} 
                onValueChange={(value) => {
                  if (value) {
                    handleConversationChange(value);
                  }
                }}
                disabled={loadingHistory}
              >
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder={loadingHistory ? "Loading..." : "Select conversation..."} />
                </SelectTrigger>
                <SelectContent>
                  {conversationHistory.map((conversation, index) => (
                    <SelectItem key={conversation.conversation_id} value={conversation.conversation_id} className="text-xs">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${
                            conversation.conversation_id === currentConversationId 
                              ? 'bg-green-500' 
                              : conversation.is_active_document 
                              ? 'bg-blue-500' 
                              : 'bg-gray-300'
                          }`}></div>
                          <span className="truncate">
                            {conversation.title || `Analysis ${index + 1}`}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {new Date(conversation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {conversationHistory.length === 0 && !loadingHistory && (
                    <SelectItem value="no-history" disabled className="text-xs text-muted-foreground">
                      No conversation history
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Model filter dropdown */}
            <div className="flex items-center gap-2 relative z-50">
              <CpuIcon className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o" className="text-xs">
                    GPT-4o
                  </SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20241022" className="text-xs">
                    Claude 3.5 Sonnet
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden px-2 py-4 min-h-0">
          <AIAnalysisTab 
            partNumber={refreshedPartNumber}
            isModal={true}
            currentConversationId={currentConversationId}
            onConversationChange={handleNewConversation}
            documentUrl={currentDocumentUrl}
            selectedModel={selectedModel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}