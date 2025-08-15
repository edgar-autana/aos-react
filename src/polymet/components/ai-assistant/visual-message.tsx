import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BotIcon, UserIcon, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface VisualMessageProps {
  content: string;
  role: 'user' | 'assistant';
  model?: string;
  metadata?: Record<string, unknown>;
}

const VisualMessage: React.FC<VisualMessageProps> = ({ content, role, model, metadata }) => {
  const isAI = role === 'assistant';
  
  // Check if this message has region data
  const hasRegionData = metadata?.selectedRegion && 
    typeof metadata.selectedRegion === 'object' && 
    metadata.selectedRegion !== null &&
    'imageData' in metadata.selectedRegion;
  
  const regionData = hasRegionData ? metadata.selectedRegion as {
    coordinates: {
      x: number;
      y: number;
      width: number;
      height: number;
      page: number;
    };
    imageData: string;
  } : null;
  
  const getModelDisplayName = (modelName?: string) => {
    if (!modelName) return null;
    switch (modelName) {
      case 'claude-3-5-sonnet-20241022':
        return 'Claude 3.5 Sonnet';
      case 'gpt-4o':
        return 'GPT-4o';
      default:
        return modelName;
    }
  };
  
  return (
    <div className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      {/* Avatar for AI messages (left side) */}
      {isAI && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <BotIcon className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message content */}
      <div className={`max-w-[85%] ${isAI ? 'space-y-1' : ''}`}>
        {/* Model badge for AI messages */}
        {isAI && model && (
          <div className="text-xs text-gray-500 font-medium mb-1">
            {getModelDisplayName(model)}
          </div>
        )}
        
        {/* Region indicator for user messages */}
        {!isAI && regionData && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 relative">
              <img 
                src={regionData.imageData.startsWith('data:') ? regionData.imageData : `data:image/png;base64,${regionData.imageData}`} 
                alt="Selected region" 
                className="w-8 h-8 object-cover rounded border border-blue-300 shadow-sm"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  // Show fallback icon
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback icon */}
              <div 
                className="w-8 h-8 bg-blue-200 border border-blue-300 rounded flex items-center justify-center shadow-sm"
                style={{ display: 'none' }}
              >
                <ImageIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-xs text-blue-700">
              <div className="font-medium">Region Analysis</div>
              <div className="text-blue-600">
                {regionData.coordinates.width}×{regionData.coordinates.height}px
              </div>
            </div>
          </div>
        )}
        
        <div className={`rounded-lg px-4 py-3 ${
          isAI 
            ? 'bg-white border border-gray-200 shadow-sm' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
        }`}>
        {isAI ? (
          <ReactMarkdown
            components={{
              // Custom styling for different elements
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-blue-600 mb-3 mt-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-3">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-gray-600 mb-2 mt-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-blue-700">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-purple-600">
                  {children}
                </em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mb-3 ml-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed">
                  {children}
                </li>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
                  <table className="min-w-full">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-200 px-4 py-2 bg-gray-50 font-semibold text-left">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-200 px-4 py-2 text-gray-700">
                  {children}
                </td>
              ),
              code: ({ children, className }) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div className="mb-3">
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg border"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-3 bg-blue-50 py-2 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-gray-300 my-4" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="text-white leading-relaxed">
            {content}
          </div>
        )}
        </div>
      </div>
      
      {/* Avatar for user messages (right side) */}
      {!isAI && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <UserIcon className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default VisualMessage; 