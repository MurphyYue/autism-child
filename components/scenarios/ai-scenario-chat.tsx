"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getScenarioResponse } from "@/lib/dify";
interface Scenario {
  id: string;
  name: string;
  description: string;
  created_at: string;
  profile_id: string;
  profile: Profile;
  scenario_type: string;
  scenario_data: string;
}

interface Profile {
  id: string;
  name: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIScenarioChatProps {
  profile: Profile;
  onScenarioCreated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIScenarioChat({
  profile,
  onScenarioCreated,
  open,
  onOpenChange,
}: AIScenarioChatProps) {
  const [selectedProfile, setSelectedProfile] = useState(profile);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedProfile) return;

    try {
      setLoading(true);
      const userMessage = input.trim();
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      const response = await getScenarioResponse(userMessage, conversationId || undefined);
      !conversationId && setConversationId(response.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer.toString() },
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>ai assistant</DialogTitle>
        </DialogHeader>
        <Card className="flex flex-col h-[86vh] sm:h-[50vh]">
          <div className="p-4 border-b">
            <Label htmlFor="profile">Child Profile: {profile.name}</Label>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-sm font-medium">AI Assistant</span>
                    </div>
                  )}
                  <ReactMarkdown className="prose dark:prose-invert">
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">Assistant is thinking</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the scenario..."
                className="flex-1 min-h-[40px] max-h-[200px] px-3 py-2 rounded-md border bg-background resize-none"
                disabled={!selectedProfile || loading}
              />
              <Button
                onClick={handleSend}
                disabled={!selectedProfile || !input.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
