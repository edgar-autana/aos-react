import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BotIcon, UserIcon, ImageIcon } from "lucide-react";
import { format } from 'date-fns';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRegionContext?: boolean;
  regionSnapshot?: string;
}

interface MessageListProps {
  messages: Message[];
  regionSnapshot: string | null;
  partNumber: {
    id: string;
    part_name?: string | null;
    drawing_number?: string | null;
  };
}

export default function MessageList({ messages, regionSnapshot, partNumber }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-muted rounded-full p-3 mb-4">
          <BotIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">Start a conversation</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Ask questions about the technical drawing, manufacturing processes, or select a region for detailed analysis.
        </p>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>Try asking:</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>What material is recommended for this part?</li>
            <li>What are the critical dimensions?</li>
            <li>What manufacturing processes are needed?</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.type === 'assistant' && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-blue-500 text-white">
                <BotIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
            <Card className={`${message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
              <CardContent className="p-3">
                {/* Region context indicator */}
                {message.hasRegionContext && (
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                    <ImageIcon className="h-3 w-3" />
                    <span>Analyzing selected region</span>
                  </div>
                )}
                
                {/* Message content */}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Region snapshot if available */}
                {message.regionSnapshot && (
                  <div className="mt-3 p-2 bg-muted rounded border">
                    <img
                      src={message.regionSnapshot}
                      alt="Selected region"
                      className="max-w-full h-auto rounded"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                )}
                
                {/* Timestamp */}
                <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {format(message.timestamp, 'HH:mm')}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {message.type === 'user' && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-primary">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}