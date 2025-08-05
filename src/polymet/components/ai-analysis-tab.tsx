import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PDFViewerWithSelection from './pdf-viewer/pdf-viewer-with-selection';
import AIAssistantChat from './ai-assistant/ai-assistant-chat';

interface AIAnalysisTabProps {
  partNumber: {
    id: string;
    part_drawing_2d: string | null;
    part_name?: string | null;
    drawing_number?: string | null;
  };
  isModal?: boolean;
  currentConversationId?: string | null;
  onConversationChange?: (conversationId: string) => void;
  documentUrl?: string | null; // Override document URL for historical conversations
}

interface SelectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  imageData?: string;
}

export default function AIAnalysisTab({ 
  partNumber, 
  isModal = false,
  currentConversationId,
  onConversationChange,
  documentUrl
}: AIAnalysisTabProps) {
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [regionSnapshot, setRegionSnapshot] = useState<string | null>(null);

  const handleRegionSelect = useCallback((region: SelectedRegion | null) => {
    setSelectedRegion(region);
    if (!region) {
      setRegionSnapshot(null);
    }
  }, []);

  const handleSnapshotCapture = useCallback((imageData: string) => {
    setRegionSnapshot(imageData);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRegion(null);
    setRegionSnapshot(null);
  }, []);

  const handleNewConversation = useCallback((conversationId: string) => {
    if (onConversationChange) {
      onConversationChange(conversationId);
    }
  }, [onConversationChange]);

  // Simple layout - PDF left, Chat right
  const containerHeight = isModal 
    ? "h-[calc(95vh-7rem)]" 
    : "h-auto lg:h-[800px] max-h-none lg:max-h-[90vh]";
  
  const gridLayout = isModal 
    ? "grid grid-cols-2 gap-4" 
    : "flex flex-col lg:grid lg:grid-cols-2";
  
  const cardHeight = isModal 
    ? "h-full" 
    : "h-[400px] lg:h-auto";
  const chatHeight = isModal 
    ? "h-full" 
    : "h-[500px] lg:h-auto";

  // Use documentUrl override if provided, otherwise use part number's document
  const currentDocumentUrl = documentUrl || partNumber.part_drawing_2d;

  return (
    <div className={isModal ? "h-full" : "space-y-6"}>
      {/* Simple two-column layout */}
      <div className={`${gridLayout} ${isModal ? "gap-4" : "gap-6"} ${isModal ? "h-full" : containerHeight}`}>
        {/* PDF Viewer - Always left column */}
        <Card className={`flex flex-col ${isModal ? "h-full overflow-hidden" : cardHeight}`}>
          <CardHeader className={`pb-3 ${isModal ? "px-3 py-2" : "px-4 lg:px-6"} flex-shrink-0`}>
            <div className="flex items-center justify-between">
              <CardTitle className={`${isModal ? "text-sm" : "text-base lg:text-lg"}`}>Technical Drawing</CardTitle>
              {selectedRegion && (
                <button
                  onClick={handleClearSelection}
                  className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                >
                  Clear Selection
                </button>
              )}
            </div>
            {partNumber.drawing_number && (
              <p className="text-xs lg:text-sm text-muted-foreground">
                Drawing: {partNumber.drawing_number}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <PDFViewerWithSelection
              pdfUrl={currentDocumentUrl}
              onRegionSelect={handleRegionSelect}
              onSnapshotCapture={handleSnapshotCapture}
              selectedRegion={selectedRegion}
            />
          </CardContent>
        </Card>

        {/* AI Assistant - Always right column */}
        <Card className={`flex flex-col ${isModal ? "h-full overflow-hidden" : `${chatHeight} min-h-[400px]`}`}>
          <CardHeader className={`pb-3 ${isModal ? "px-3 py-2" : "px-4 lg:px-6"} flex-shrink-0`}>
            <CardTitle className={`${isModal ? "text-sm" : "text-base lg:text-lg"}`}>AI Assistant</CardTitle>
            <p className={`${isModal ? "text-xs" : "text-xs lg:text-sm"} text-muted-foreground`}>
              Ask questions about the technical drawing or selected regions
            </p>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <AIAssistantChat
              partNumber={partNumber}
              selectedRegion={selectedRegion}
              regionSnapshot={regionSnapshot}
              onClearSelection={handleClearSelection}
              conversationId={currentConversationId}
              onConversationChange={handleNewConversation}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}