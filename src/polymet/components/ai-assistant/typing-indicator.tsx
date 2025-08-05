import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BotIcon } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <BotIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="max-w-[85%] bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
}