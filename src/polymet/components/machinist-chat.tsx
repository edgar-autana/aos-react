import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, BotIcon, UserIcon, RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PartAnalysis } from "@/polymet/components/technical-analysis-result";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MachinistChatProps {
  analysis: PartAnalysis | null;
  isLoading: boolean;
}

export default function MachinistChat({
  analysis,
  isLoading,
}: MachinistChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your CNC Machinist Assistant. Ask me anything about this part analysis or how to optimize the machining strategy.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with a delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, analysis);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your CNC Machinist Assistant. Ask me anything about this part analysis or how to optimize the machining strategy.",
        timestamp: new Date(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BotIcon className="h-5 w-5 mr-2" />
            Machinist Assistant
            <Badge variant="outline" className="ml-2 bg-muted">
              Loading
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
            <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BotIcon className="h-5 w-5 mr-2" />
            Machinist Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload and analyze a part to chat with the Machinist Assistant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <BotIcon className="h-5 w-5 mr-2" />
            Machinist Assistant
            <Badge variant="outline" className="ml-2 text-xs">
              Expert
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={clearChat}
            title="Clear chat"
          >
            <RefreshCwIcon className="h-4 w-4" />

            <span className="sr-only">Clear chat</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-[400px] p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src="https://github.com/polymet-ai.png" />

                  <AvatarFallback>
                    <BotIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 ml-2 mt-1">
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex mb-4 justify-start">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://github.com/polymet-ai.png" />

                <AvatarFallback>
                  <BotIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted text-foreground rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about machining strategy, tooling, etc..."
            disabled={isLoading}
            className="flex-1"
          />

          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <SendIcon className="h-4 w-4" />

            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Helper function to format timestamp
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Helper function to generate AI responses based on user input and part analysis
function generateAIResponse(
  userInput: string,
  analysis: PartAnalysis | null
): string {
  if (!analysis) return "Please upload a part for analysis first.";

  const input = userInput.toLowerCase();

  // Check for questions about material
  if (
    input.includes("material") ||
    input.includes("steel") ||
    input.includes("stainless")
  ) {
    return `The part is made of ${analysis.rawMaterial}. When machining this material, I recommend using ${
      analysis.machiningStrategy.notes || "appropriate cutting parameters"
    }. For this specific material, coolant is crucial to prevent work hardening.`;
  }

  // Check for questions about tooling
  if (
    input.includes("tool") ||
    input.includes("end mill") ||
    input.includes("drill") ||
    input.includes("cutter")
  ) {
    const toolingList = analysis.machiningStrategy.tooling.join("\n• ");
    return `For this part, I recommend the following tooling:\n\n• ${toolingList}\n\nThese tools are selected based on the part geometry and material properties.`;
  }

  // Check for questions about fixturing
  if (
    input.includes("fixture") ||
    input.includes("clamp") ||
    input.includes("holding")
  ) {
    return `For fixturing this part, I recommend: ${analysis.machiningStrategy.fixturing}\n\nThis approach will ensure proper stability and prevent distortion during machining.`;
  }

  // Check for questions about cycle time
  if (
    input.includes("time") ||
    input.includes("cycle") ||
    input.includes("duration")
  ) {
    return `The estimated total cycle time for this part is ${analysis.cycleTime.total} minutes. This includes setup time, machining operations, and final inspection. The most time-consuming operation is ${
      analysis.cycleTime.operations.reduce((prev, current) =>
        prev.time > current.time ? prev : current
      ).name
    }.`;
  }

  // Check for questions about machine
  if (
    input.includes("machine") ||
    input.includes("cnc") ||
    input.includes("equipment")
  ) {
    return `I recommend using a ${analysis.recommendedMachine.name} (${
      analysis.recommendedMachine.type
    }) for this part. This machine offers capabilities like ${analysis.recommendedMachine.capabilities.join(
      ", "
    )}, which are ideal for the required operations.`;
  }

  // Check for questions about surface finish
  if (
    input.includes("surface") ||
    input.includes("finish") ||
    input.includes("roughness")
  ) {
    return `The required surface finish for this part is ${analysis.surfaceFinish}. To achieve this, I recommend using finishing passes with a ball nose end mill at high RPM and low feed rate. Make sure to maintain sharp tooling and adequate coolant flow.`;
  }

  // Check for suggestions to improve or optimize
  if (
    input.includes("improve") ||
    input.includes("optimize") ||
    input.includes("better") ||
    input.includes("faster")
  ) {
    return `To optimize the machining process for this ${analysis.partName}, consider:\n\n1. Using a high-feed roughing strategy to reduce cycle time\n2. Implementing tool path optimization software to minimize air cuts\n3. Using a higher-performance coolant mixture for better heat dissipation\n4. Consider a different fixturing approach that allows machining more features in a single setup\n\nThese changes could potentially reduce the cycle time by 15-20% while maintaining quality.`;
  }

  // Check for questions about complexity
  if (
    input.includes("complex") ||
    input.includes("difficult") ||
    input.includes("challenging")
  ) {
    return `This part has ${analysis.complexity.toLowerCase()} complexity. The most challenging aspects are the tight tolerances (±${
      analysis.instructions
        .find((i) => i.includes("tolerance"))
        ?.match(/±([\d.]+)/)?.[1] || "0.05"
    }mm) and the requirement for ${
      analysis.instructions.find((i) => i.includes("perpendicular"))
        ? "perpendicular surfaces"
        : "precise feature relationships"
    }.`;
  }

  // Default response for other queries
  return `Based on the analysis of ${analysis.partName} (Part #${analysis.partNumber}), I can provide guidance on machining approach, tooling selection, and process optimization. What specific aspect would you like to know more about? You can ask about material properties, fixturing, tooling, cycle time, or suggestions for improvement.`;
}
