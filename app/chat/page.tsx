"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { getStarCatResponse } from "@/lib/dify";
import { Send, Bot, Brain, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import { type Scenario } from "@/types/scenario";
import { type Profile } from "@/types/profile";
import { useTranslations } from "next-intl";
import './gradient-bg.css';


interface ChildResponse {
  emotion: string;
  action: string;
  saying: string;
  abnormal: string;
}

interface ExpertResponse {
  reason: string;
  evaluate: string;
  suggestion: string;
  answer: string;
}

interface Message {
  role: "user" | "assistant" | "expert";
  content: string;
  suggestedResponses?: string[];
  abnormal?: boolean;
}

export default function SimulatedConversationPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, userLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Chat");

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/auth/login?redirectTo=/chat");
      return;
    }
    fetchProfiles();
  }, [user, router]);

  useEffect(() => {
    if (selectedProfile) {
      fetchScenarios();
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (selectedScenario) {
      initializeConversation();
    }
  }, [selectedScenario]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, age, behavior_features, sensory_preferences")
        .order("name");

      if (error) throw error;
      setProfiles(data || []);
      data[0].id && setSelectedProfile(data[0].id);
      fetchScenarios(data[0].id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: t("profile_get_error"),
        variant: "destructive",
      });
    }
  };

  const fetchScenarios = async (id: string | undefined = undefined) => {
    try {
      const { data, error } = await supabase
        .from("scenarios")
        .select(
          "id, title, time, participant, location, child_behavior, trigger_event, parent_response, profile_id, created_at, updated_at"
        )
        .eq("profile_id", id || selectedProfile)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScenarios(
        data?.map((item) => ({
          ...item,
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
          parent_response: item.parent_response || "",
        })) || []
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: t("scenario_get_error"),
        variant: "destructive",
      });
    }
  };

  // Parse the answers from the response
  const parseResponse = (answerText: {
    child: ChildResponse;
    expert: ExpertResponse;
  }): { childMessage: Message; expertMessage: Message } => {
    const childObj: ChildResponse = answerText.child;
    const expertObj: ExpertResponse = answerText.expert;

    const childMessage: Message = {
      role: "assistant",
      content: `**${t("emotion")}:** ${childObj.emotion}\n\n**${t("action")}:** ${
        childObj.action
      }\n\n**${t("saying")}:** ${childObj.saying}\n\n`,
      abnormal: childObj.abnormal === "true"
    };

    const expertMessage: Message = {
      role: "expert",
      content: `**${t("reason")}:** ${expertObj.reason}\n\n**${t("evaluate")}:** ${expertObj.evaluate}\n\n**${t("suggestion")}:** ${expertObj.suggestion}`,
      suggestedResponses: expertObj.answer.split("\\n").map((s) => s.trim()),
    };

    return { childMessage, expertMessage };
  };

  // initializeConversation function
  const initializeConversation = async () => {
    const scenario = scenarios.find((s) => s.id === selectedScenario);
    const profile = profiles.find((p) => p.id === selectedProfile);
    if (!scenario || !profile) return;
    const { name, age, gender, diagnosis_age, diagnosis_source, severity, behavior_features, sensory_preferences} = profile;
    const childIntroduction = {
      name,
      age,
      gender,
      diagnosis_age,
      diagnosis_source,
      severity,
      has_friends: behavior_features.has_friends,
      is_in_school: behavior_features.is_in_school,
      can_express_needs: behavior_features.can_express_needs,
      has_self_stimulation: behavior_features.has_self_stimulation,
      can_perform_daily_tasks: behavior_features.can_perform_daily_tasks,
      can_initiate_conversation: behavior_features.can_initiate_conversation,
      sensory_preferences: sensory_preferences.sensory_preferences,
      special_interests: sensory_preferences.special_interests,
      environmental_response: sensory_preferences.environmental_response
    };
    try {
      setLoading(true);
      setMessages([]); // Clear previous messages

      const inputMsg = {
        child_introduction: childIntroduction,
        time: scenario.time,
        location: scenario.location,
        participant: scenario.participant,
        child_behavior: scenario.child_behavior,
        trigger_event: scenario.trigger_event,
      };

      const response = await getStarCatResponse(
        scenario.parent_response,
        undefined,
        inputMsg
      );

      setConversationId(response.conversation_id);
      let rawAnswer = response.answer;
      try {
        // Ensure rawAnswer is a string
        if (typeof rawAnswer !== 'string') {
          rawAnswer = JSON.stringify(rawAnswer);
        }
        
        // Clean invalid space characters (like \u00a0)
        rawAnswer = rawAnswer.replace(/\u00a0/g, " ");
        
        // Try direct parsing
        try {
          const ans = JSON.parse(rawAnswer);
          console.log("✅ Direct parsing successful!", ans);
          const { childMessage, expertMessage } = parseResponse(ans);
          setMessages([childMessage, expertMessage]);
          return;
        } catch (directParseError) {
          console.log("Direct parsing failed, trying manual parsing", directParseError);
        }
        
        // If direct parsing fails, try manual parsing
        console.log("Attempting manual JSON parsing");
        
        // Try using regex to extract key fields
        const childPattern = /[\s\S]*"child"\s*:\s*{([^}]*)}/;
        const expertPattern = /"expert"\s*:\s*{([^}]*)}/;
        
        const childMatch = rawAnswer.match(childPattern);
        const expertMatch = rawAnswer.match(expertPattern);
        
        if (childMatch && expertMatch) {
          const childContent = '{' + childMatch[1].trim() + '}';
          const expertContent = '{' + expertMatch[1].trim() + '}';
          
          console.log("Extracted child content:", childContent);
          console.log("Extracted expert content:", expertContent);
          
          // Process field values
          const processFieldValue = (str: string): string => {
            return str.replace(/\n/g, '\\n')
                      .replace(/\r/g, '\\r')
                      .replace(/\t/g, '\\t');
          };
          
          // Extract and clean child fields
          const emotionMatch = childContent.match(/"emotion"\s*:\s*"([^"]*)"/); 
          const actionMatch = childContent.match(/"action"\s*:\s*"([^"]*)"/); 
          const sayingMatch = childContent.match(/"saying"\s*:\s*"([^"]*)"/); 
          const abnormalMatch = childContent.match(/"abnormal"\s*:\s*"([^"]*)"/); 
          
          // Extract and clean expert fields
          const reasonMatch = expertContent.match(/"reason"\s*:\s*"([^"]*)"/); 
          const evaluateMatch = expertContent.match(/"evaluate"\s*:\s*"([^"]*)"/); 
          const suggestionMatch = expertContent.match(/"suggestion"\s*:\s*"([^"]*)"/); 
          const answerMatch = expertContent.match(/"answer"\s*:\s*"([^"]*)"/); 
          
          // Build manually parsed object
          const ans = {
            child: {
              emotion: emotionMatch ? emotionMatch[1] : "",
              action: actionMatch ? actionMatch[1] : "",
              saying: sayingMatch ? sayingMatch[1] : "",
              abnormal: abnormalMatch ? abnormalMatch[1] : ""
            },
            expert: {
              reason: reasonMatch ? reasonMatch[1] : "",
              evaluate: evaluateMatch ? evaluateMatch[1] : "",
              suggestion: suggestionMatch ? suggestionMatch[1] : "",
              answer: answerMatch ? processFieldValue(answerMatch[1]) : ""
            }
          };
          
          console.log("✅ Manual parsing successful!", ans);
          const { childMessage, expertMessage } = parseResponse(ans);
          setMessages([childMessage, expertMessage]);
          return;
        }
        
        // If regex extraction fails, try more aggressive methods
        console.error("Regex extraction failed, trying more aggressive methods");
        
        // Replace actual newlines with escaped newlines
        const fixedJson = rawAnswer
          .replace(/(["'])(?:\\.|[^\\])*?\1|\n/g, match => {
            if (match === '\n') return '\\n';
            return match;
          })
          .replace(/(["'])(?:\\.|[^\\])*?\1|\r/g, match => {
            if (match === '\r') return '\\r';
            return match;
          })
          .replace(/(["'])(?:\\.|[^\\])*?\1|\t/g, match => {
            if (match === '\t') return '\\t';
            return match;
          });
        
        console.log("Fixed JSON:", fixedJson);
        const ans = JSON.parse(fixedJson);
        console.log("✅ Parsing successful after fixing!", ans);
        
        const { childMessage, expertMessage } = parseResponse(ans);
        setMessages([childMessage, expertMessage]);
      } catch (err) {
        console.error("❌ Parsing failed:", err);
        console.error("Original data type:", typeof rawAnswer);
        console.error("Original data content:", rawAnswer);
        
        // Last attempt: use a simple default object
        try {
          console.log("Trying to use default values");
          const defaultAns = {
            child: {
              emotion: "Unknown emotion",
              action: "Unknown action",
              saying: "",
              abnormal: "true"
            },
            expert: {
              reason: "Unable to parse server response",
              evaluate: "Please check server response format",
              suggestion: "Please try restarting the conversation",
              answer: "1.Please restart the conversation\n2.Check server response format"
            }
          };
          const { childMessage, expertMessage } = parseResponse(defaultAns);
          setMessages([childMessage, expertMessage]);
        } catch (finalError) {
          console.error("❌ Final failure, unable to create default object", finalError);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error",
        description: t("conversation_init_error"),
        variant: "destructive",
      });
      setSelectedScenario(""); // Reset scenario selection on error
    } finally {
      setLoading(false);
    }
  };

  // handleSend function
  const handleSend = async (content: string = input) => {
    const messageContent = content.trim() || input.trim();
    if (!messageContent || !selectedProfile || !selectedScenario) return;

    try {
      setLoading(true);
      setInput("");

      // Add user message immediately
      const userMessage: Message = { role: "user", content: messageContent };
      setMessages((prev) => [...prev, userMessage]);

      const scenario = scenarios.find((s) => s.id === selectedScenario);
      const profile = profiles.find((p) => p.id === selectedProfile);
      if (!scenario || !profile) return;

      const inputMsg = {
        child_introduction: JSON.stringify(profile),
        time: scenario.time,
        location: scenario.location,
        participant: scenario.participant,
        child_behavior: scenario.child_behavior,
        trigger_event: scenario.trigger_event,
      };

      const response = await getStarCatResponse(
        messageContent,
        conversationId,
        inputMsg
      );
      let rawAnswer = response.answer;
      try {
        // Ensure rawAnswer is a string
        if (typeof rawAnswer !== 'string') {
          rawAnswer = JSON.stringify(rawAnswer);
        }
        
        // Clean invalid space characters (like \u00a0)
        rawAnswer = rawAnswer.replace(/\u00a0/g, " ");
        
        // Try direct parsing
        try {
          const ans = JSON.parse(rawAnswer);
          console.log("✅ Direct parsing successful!", ans);
          const { childMessage, expertMessage } = parseResponse(ans);
          setMessages((prev) => [...prev, childMessage, expertMessage]);
          return;
        } catch (directParseError) {
          console.log("Direct parsing failed, trying manual parsing", directParseError);
        }
        
        // If direct parsing fails, try manual parsing
        console.log("Attempting manual JSON parsing");
        
        // Try using regex to extract key fields
        const childPattern = /[\s\S]*"child"\s*:\s*{([^}]*)}/;
        const expertPattern = /"expert"\s*:\s*{([^}]*)}/;
        
        const childMatch = rawAnswer.match(childPattern);
        const expertMatch = rawAnswer.match(expertPattern);
        
        if (childMatch && expertMatch) {
          const childContent = '{' + childMatch[1].trim() + '}';
          const expertContent = '{' + expertMatch[1].trim() + '}';
          
          console.log("Extracted child content:", childContent);
          console.log("Extracted expert content:", expertContent);
          
          // Process field values
          const processFieldValue = (str: string): string => {
            return str.replace(/\n/g, '\\n')
                      .replace(/\r/g, '\\r')
                      .replace(/\t/g, '\\t');
          };
          
          // Extract and clean child fields
          const emotionMatch = childContent.match(/"emotion"\s*:\s*"([^"]*)"/); 
          const actionMatch = childContent.match(/"action"\s*:\s*"([^"]*)"/); 
          const sayingMatch = childContent.match(/"saying"\s*:\s*"([^"]*)"/); 
          const abnormalMatch = childContent.match(/"abnormal"\s*:\s*"([^"]*)"/); 
          
          // Extract and clean expert fields
          const reasonMatch = expertContent.match(/"reason"\s*:\s*"([^"]*)"/); 
          const evaluateMatch = expertContent.match(/"evaluate"\s*:\s*"([^"]*)"/); 
          const suggestionMatch = expertContent.match(/"suggestion"\s*:\s*"([^"]*)"/); 
          const answerMatch = expertContent.match(/"answer"\s*:\s*"([^"]*)"/); 
          
          // Build manually parsed object
          const ans = {
            child: {
              emotion: emotionMatch ? emotionMatch[1] : "",
              action: actionMatch ? actionMatch[1] : "",
              saying: sayingMatch ? sayingMatch[1] : "",
              abnormal: abnormalMatch ? abnormalMatch[1] : ""
            },
            expert: {
              reason: reasonMatch ? reasonMatch[1] : "",
              evaluate: evaluateMatch ? evaluateMatch[1] : "",
              suggestion: suggestionMatch ? suggestionMatch[1] : "",
              answer: answerMatch ? processFieldValue(answerMatch[1]) : ""
            }
          };
          
          console.log("✅ Manual parsing successful!", ans);
          const { childMessage, expertMessage } = parseResponse(ans);
          setMessages((prev) => [...prev, childMessage, expertMessage]);
          return;
        }
        
        // If regex extraction fails, try more aggressive methods
        console.error("Regex extraction failed, trying more aggressive methods");
        
        // Replace actual newlines with escaped newlines
        const fixedJson = rawAnswer
          .replace(/(["'])(?:\\.|[^\\])*?\1|\n/g, match => {
            if (match === '\n') return '\\n';
            return match;
          })
          .replace(/(["'])(?:\\.|[^\\])*?\1|\r/g, match => {
            if (match === '\r') return '\\r';
            return match;
          })
          .replace(/(["'])(?:\\.|[^\\])*?\1|\t/g, match => {
            if (match === '\t') return '\\t';
            return match;
          });
        
        console.log("Fixed JSON:", fixedJson);
        const ans = JSON.parse(fixedJson);
        console.log("✅ Parsing successful after fixing!", ans);
        
        const { childMessage, expertMessage } = parseResponse(ans);
        setMessages((prev) => [...prev, childMessage, expertMessage]);
      } catch (err) {
        console.error("❌ Parsing failed:", err);
        console.error("Original data type:", typeof rawAnswer);
        console.error("Original data content:", rawAnswer);
        
        // Try more aggressive way to parse JSON
        try {
          // Remove all newlines and extra spaces
          const cleanedJson = rawAnswer.replace(/\s+/g, ' ')
            .replace(/\\n/g, '\\n')
            .replace(/\\r/g, '\\r')
            .replace(/\\t/g, '\\t');
          
          console.log("Trying to parse again after cleaning:", cleanedJson);
          const ans = JSON.parse(cleanedJson);
          console.log("✅ Parsing successful after cleaning!", ans);
          
          const { childMessage, expertMessage } = parseResponse(ans);
          setMessages((prev) => [...prev, childMessage, expertMessage]);
        } catch (finalError) {
          console.error("❌ Final parsing failure:", finalError);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: t("message_send_error"),
        variant: "destructive",
      });
      // Remove the user message if the API call fails
      setMessages((prev) => prev.slice(0, -1));
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 sm:p-6">
      <div className="max-w-4xl mx-auto h-full">
        <h1 className="text-3xl font-bold mb-8 hidden sm:inline-block">
          {t("title")}
        </h1>

        <div className="flex flex-col h-full sm:h-[600px]" style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(184, 196, 255, 0.6), transparent 25%), " +
                "radial-gradient(circle at 70% 60%, rgba(255, 184, 222, 0.6), transparent 25%), " +
                "radial-gradient(circle at 40% 80%, rgba(184, 255, 214, 0.6), transparent 25%), " +
                "radial-gradient(circle at 80% 30%, rgba(255, 222, 184, 0.6), transparent 25%)",
            }}>
          <div className="p-4 border-b space-y-4">
            {selectedProfile && (
              <div>
                {/* <Label htmlFor="scenario">{t("scenario_title")}</Label> */}
                <Select
                  value={selectedScenario}
                  onValueChange={setSelectedScenario}
                >
                  <SelectTrigger className="bg-gradient-to-tr from-yellow-100/30 via-blue-100/20 to-pink-100/30 dark:from-yellow-900/20 dark:via-blue-800/20 dark:to-pink-900/20 z-0">
                    <SelectValue placeholder={t("scenario_choose")} />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                      : message.role === "expert"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {t("child_simulation")}
                      </span>
                    </div>
                  )}
                  {message.role === "expert" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {t("expert_insight")}
                      </span>
                    </div>
                  )}
                  <ReactMarkdown className="prose dark:prose-invert">
                    {message.content}
                  </ReactMarkdown>
                  {message.abnormal && message.role === "assistant" && (
                    <div className="mt-3 space-y-2">
                      <div className="text-red-500">{t("abnormal")}</div>
                    </div>
                  )}
                  {!message.abnormal && message.role === "assistant" && (
                    <div className="mt-3 space-y-2">
                      <div className="text-green-500">{t("normal")}</div>
                    </div>
                  )}
                  {message.suggestedResponses && (
                    <div className="mt-3 space-y-2">
                      <Label
                        htmlFor="suggestedResponses"
                        className="font-bold text-black dark:text-white"
                      >
                        {t("suggested_responses")}:
                      </Label>
                      {message.suggestedResponses.map((response, i) => (
                        <div
                          key={i}
                          className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-white dark:bg-gray-800 dark:text-white"
                          onClick={() => handleSend(response)}
                        >
                          <span className="flex-1">{response}</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      ))}
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
                      {t("child_expert_thinking")}
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

          <div className="p-4 border-t sticky bottom-0 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("placeholder")}
                className="flex-1 min-h-[40px] max-h-[200px] px-3 py-2 rounded-md border bg-background resize-none"
                disabled={!selectedProfile || !selectedScenario || loading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={
                  !selectedProfile ||
                  !selectedScenario ||
                  !input.trim() ||
                  loading
                }
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
