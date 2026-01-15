"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslations } from "next-intl";
import { getScenarioResponse } from "@/lib/dify";
import { type Scenario } from "@/types/scenario";

interface Profile {
  id: string;
  name: string;
}

interface Message {
  role: "user" | "assistant";
  content: string | Scenario;
  completed?: boolean;
}

export default function ChatPage() {
  const { user, userLoading } = useAuth();
  const { toast } = useToast();
  const t = useTranslations("Scenarios");
  const t2 = useTranslations("Scenarios.chat");
  const t3 = useTranslations("Scenarios.create");
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ id: "", name: "" });
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t2("welcome_message") },
  ]);
  const [conversationId, setConversationId] = useState<string>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/auth/login?redirectTo=/scenarios");
      return;
    }

    fetchProfile();
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setProfile(data[0] || { id: "", name: "" });
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !profile) {
      toast({
        title: t2("error"),
        description: t2("empty_message"),
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
        title: t2("error"),
        description: t2("error_message"),
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
        parent_response: scenario.parent_response,
      });

      if (error) throw error;
      setMessages([]);
      toast({
        title: t2("success"),
        description: t2("save_success"),
      });
      router.push("/scenarios");
    } catch (error) {
      toast({
        title: t2("error"),
        description: t2("save_error"),
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

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("loading")}</h1>
        </div>
      </div>
    );
  }

  if (!profile.name) {
    return (
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {t("create_profile_first")}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <Card className="flex flex-col h-[93vh]">
          <div className="p-4 border-b flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/scenarios")}
            >
              {t2("back")}
            </Button>
            <Label htmlFor="profile">{t3("child_profile")}: {profile.name}</Label>
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
                      <span className="text-sm font-medium">{t2("title")}</span>
                    </div>
                  )}
                  {message.completed ? (
                    <>
                      <div key={index} className="prose dark:prose-invert">
                        {typeof message.content === "object" &&
                          "time" in message.content && (
                            <div>
                              {t2("scenario_time")}: {message.content.time}
                            </div>
                          )}
                        {typeof message.content === "object" &&
                          "location" in message.content && (
                            <div>
                              {t2("scenario_location")}:{" "}
                              {message.content.location}
                            </div>
                          )}
                        {typeof message.content === "object" &&
                          "participant" in message.content && (
                            <div>
                              {t2("scenario_participant")}:{" "}
                              {message.content.participant}
                            </div>
                          )}
                        {typeof message.content === "object" &&
                          "child_behavior" in message.content && (
                            <div>
                              {t2("scenario_child_behavior")}:{" "}
                              {message.content.child_behavior}
                            </div>
                          )}
                        {typeof message.content === "object" &&
                          "trigger_event" in message.content && (
                            <div>
                              {t2("scenario_trigger_event")}:{" "}
                              {message.content.trigger_event}
                            </div>
                          )}
                        {typeof message.content === "object" &&
                          "parent_response" in message.content && (
                            <div>
                              {t2("scenario_parent_response")}:{" "}
                              {message.content.parent_response}
                            </div>
                          )}
                      </div>
                      <Button
                        className="mt-2"
                        onClick={() =>
                          handleSubmit(message.content as Scenario)
                        }
                      >
                        {t2("save_scenario")}
                      </Button>
                    </>
                  ) : (
                    <div className="prose dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                      >
                        {typeof message.content === "string"
                          ? message.content
                          : JSON.stringify(message.content)}
                      </ReactMarkdown>
                    </div>
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
                      {t2("generating")}
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
                placeholder={t2("placeholder")}
                className="flex-1 min-h-[40px] max-h-[200px] px-3 py-2 rounded-md border bg-background resize-none"
                disabled={!profile || loading}
              />
              <Button
                onClick={handleSend}
                disabled={!profile || !input.trim() || loading}
                title={t2("send")}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
