"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getScenarioResponse } from "@/lib/dify";
import { supabase } from "@/lib/supabase";
import { type Scenario } from '@/types/scenario';

interface Profile {
  id: string;
  name: string;
}

interface Message {
  role: "user" | "assistant";
  content: string | Scenario;
  completed?: boolean;
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
  const t = useTranslations('Scenarios.chat');
  const [selectedProfile, setSelectedProfile] = useState(profile);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t('welcome_message') }
  ]);
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
    if (!input.trim() || !selectedProfile) {
      toast({
        title: t('error'),
        description: t('empty_message'),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const userMessage = input.trim();
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      const response = await getScenarioResponse(
        userMessage,
        conversationId || undefined
      );
      !conversationId && setConversationId(response.conversation_id);
      const { completed, message, data } = JSON.parse(response.answer);
      if (!completed) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message, completed: false },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data, completed: true },
        ]);
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: t('error'),
        description: t('error_message'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (scenario: Scenario) => {
    setLoading(true);

    try {
      const { error } = await supabase.from("scenarios").insert({
        profile_id: profile.id,
        title: `AI Assistant: ${new Date().toISOString()}`,
        time: scenario.time,
        location: scenario.location,
        participant: scenario.participant,
        child_behavior: scenario.child_behavior,
        trigger_event: scenario.trigger_event,
      });

      if (error) throw error;
      setMessages([]);
      toast({
        title: t('success'),
        description: t('save_success'),
      });
      onScenarioCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('save_error'),
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
          <DialogTitle>{t('title')}</DialogTitle>
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
                      <span className="text-sm font-medium">{t('title')}</span>
                    </div>
                  )}
                  {message.completed ? (
                    <>
                      <div key={index} className="prose dark:prose-invert">
                        {typeof message.content === "object" &&
                          "time" in message.content && (
                            <div>{t('scenario_time')}: {message.content.time}</div>
                          )}
                        {typeof message.content === "object" &&
                          "location" in message.content && (
                            <div>{t('scenario_location')}: {message.content.location}</div>
                          )}
                        {typeof message.content === "object" &&
                          "participant" in message.content && (
                            <div>{t('scenario_participant')}: {message.content.participant}</div>
                          )}
                        {typeof message.content === "object" &&
                          "child_behavior" in message.content && (
                            <div>
                              {t('scenario_child_behavior')}: {message.content.child_behavior}
                            </div>
                          )}
                        {typeof message.content === "object" &&
                          "trigger_event" in message.content && (
                            <div>
                              {t('scenario_trigger_event')}: {message.content.trigger_event}
                            </div>
                          )}
                      </div>
                      <Button className="mt-2" onClick={() => handleSubmit(message.content as Scenario)}>
                        {t('save_scenario')}
                      </Button>
                    </>
                  ) : (
                    <ReactMarkdown className="prose dark:prose-invert">
                      {typeof message.content === "string"
                        ? message.content
                        : JSON.stringify(message.content)}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      {t('generating')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
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
                placeholder={t('placeholder')}
                className="flex-1 min-h-[40px] max-h-[200px] px-3 py-2 rounded-md border bg-background resize-none"
                disabled={!selectedProfile || loading}
              />
              <Button
                onClick={handleSend}
                disabled={!selectedProfile || !input.trim() || loading}
                title={t('send')}
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
