import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/hooks/use-web-socket";
import { formatDate } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: "founder" | "investor";
  content: string;
  timestamp: string;
}

interface ChatProps {
  roomId: string;
  userId: string;
  userRole: "founder" | "investor";
}

export default function Chat({ roomId, userId, userRole }: ChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket, connected, error } = useWebSocket({
    path: `/ws/pitch-room/${roomId}`,
  });
  
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "message") {
            setMessages((prev) => [...prev, data.message]);
            scrollToBottom();
          } else if (data.type === "history") {
            setMessages(data.messages);
            scrollToBottom();
          }
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      };
    }
    
    return () => {
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [socket]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (!message.trim() || !connected || !socket) return;
    
    const newMessage = {
      senderId: userId,
      content: message,
      roomId,
    };
    
    socket.send(JSON.stringify({
      type: "message",
      data: newMessage,
    }));
    
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-2 border-b">
        <CardTitle className="text-lg font-medium">Pitch Room Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[70%] flex ${
                      msg.senderId === userId ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${msg.senderId === userId ? "ml-2" : "mr-2"}`}>
                      <AvatarImage src={msg.senderAvatar} />
                      <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.senderId === userId 
                            ? "bg-primary-600 text-white" 
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div 
                        className={`text-xs text-gray-500 mt-1 ${
                          msg.senderId === userId ? "text-right" : "text-left"
                        }`}
                      >
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t">
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none"
              disabled={!connected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !connected}
              className="self-end"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
          {!connected && (
            <p className="text-xs text-red-500 mt-1">
              {error || "Disconnected. Attempting to reconnect..."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
