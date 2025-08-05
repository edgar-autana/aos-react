import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, FileTextIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversationService, ConversationHistory } from '../../services/conversation-service';
import { handleApiError } from '../../utils/conversation-api';

interface HistoryPanelProps {
  partNumberId: string;
  history?: ConversationHistory[];
  onConversationSelect: (conversationId: string) => void;
  currentConversationId: string | null;
  className?: string;
  loading?: boolean;
}

export default function HistoryPanel({ 
  partNumberId, 
  history: externalHistory,
  onConversationSelect, 
  currentConversationId,
  className = "",
  loading: externalLoading = false
}: HistoryPanelProps) {
  const [internalHistory, setInternalHistory] = useState<ConversationHistory[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (offset = 0, append = false) => {
    if (!partNumberId) return;
    
    setInternalLoading(true);
    setError(null);
    
    try {
      const response = await conversationService.getPartHistory(partNumberId, {
        limit: 20,
        offset: offset,
        includeArchived: false
      });
      
      if (response.success) {
        setInternalHistory(append ? [...internalHistory, ...response.analysis_history] : response.analysis_history);
        setHasMore(response.has_more);
      } else {
        setError('Failed to fetch history');
        console.error('Failed to fetch history');
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Failed to fetch history');
      handleApiError(error, 'fetch history');
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (partNumberId) {
      setPage(0);
      setInternalHistory([]);
      setHasMore(true);
      setError(null);
      fetchHistory(0, false);
    }
  }, [partNumberId]);

  // Update internal history when external history changes
  useEffect(() => {
    if (externalHistory) {
      setInternalHistory(externalHistory);
    }
  }, [externalHistory]);

  const loadMore = () => {
    if (internalLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage * 20, true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Compact header for dropdown */}
      <div className="p-2 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Analysis History</h3>
        {partNumberId && (
          <p className="text-xs text-gray-500 mt-1">Part Number: {partNumberId}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-64">
          <div className="p-2">
            {(externalLoading || internalLoading) && (externalHistory?.length || 0) === 0 && internalHistory.length === 0 ? (
              <div className="p-2 text-center text-gray-500 text-sm">Loading history...</div>
            ) : error ? (
              <div className="p-2 text-center text-red-500 text-sm">{error}</div>
            ) : (externalHistory?.length || 0) === 0 && internalHistory.length === 0 ? (
              <div className="p-2 text-center text-gray-500 text-sm">
                No analysis history found for this part number.
              </div>
            ) : (
              <div className="space-y-1">
                {(externalHistory || internalHistory).map((item) => (
                  <div
                    key={item.conversation_id}
                    onClick={() => onConversationSelect(item.conversation_id)}
                    className={`p-2 rounded border cursor-pointer transition-colors hover:bg-gray-50 ${
                      currentConversationId === item.conversation_id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Title and Active Status */}
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-medium text-gray-900 line-clamp-1 flex-1 pr-2">
                        {item.title}
                      </h4>
                      {item.is_active_document && (
                        <Badge className={`${getStatusColor(true)} text-xs`} variant="secondary">
                          Active
                        </Badge>
                      )}
                    </div>

                    {/* Document Info */}
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <FileTextIcon className="w-3 h-3 mr-1" />
                      <span className="truncate">{item.document_type?.toUpperCase() || 'Document'}</span>
                    </div>

                    {/* Materials and Processes - more compact */}
                    {((item.materials_identified && item.materials_identified.length > 0) || (item.processes_identified && item.processes_identified.length > 0)) && (
                      <div className="mb-1">
                        {item.materials_identified && item.materials_identified.length > 0 && (
                          <div className="mb-0.5">
                            <span className="text-xs text-gray-600">Materials: </span>
                            <span className="text-xs text-gray-800">
                              {item.materials_identified.slice(0, 1).join(', ')}
                              {item.materials_identified.length > 1 && '...'}
                            </span>
                          </div>
                        )}
                        {item.processes_identified && item.processes_identified.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-600">Processes: </span>
                            <span className="text-xs text-gray-800">
                              {item.processes_identified.slice(0, 1).join(', ')}
                              {item.processes_identified.length > 1 && '...'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.message_count} messages</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>

                    {/* Cost Info */}
                    {item.cost_estimation?.total_estimated_cost && (
                      <div className="mt-1 text-xs">
                        <span className="text-gray-600">Est. Cost: </span>
                        <span className="font-medium text-gray-900">
                          ${item.cost_estimation.total_estimated_cost.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <Button
                    onClick={loadMore}
                    disabled={internalLoading}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50 h-6"
                  >
                    {internalLoading ? 'Loading...' : 'Load More'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}