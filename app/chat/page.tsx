'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { getStarCatResponse } from '@/lib/dify';
import { Send, Bot, Brain, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { type Scenario } from '@/types/scenario';
import { useTranslations } from 'next-intl';

interface Profile {
  id: string;
  name: string;
  age?: number;
  behavior_features?: Record<string, any>;
}

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
  answer: string[];
}

interface Message {
  role: 'user' | 'assistant' | 'expert';
  content: string;
  suggestedResponses?: string[];
}

export default function SimulatedConversationPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Chat');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, age, behavior_features')
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
      data[0].id && setSelectedProfile(data[0].id);
      fetchScenarios(data[0].id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchScenarios = async (id: string | undefined = undefined) => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('id, title, time, participant, location, child_behavior, trigger_event, profile_id, created_at, updated_at')
        .eq('profile_id', id || selectedProfile)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data?.map(item => ({
        ...item,
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      })) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };


  
  // Parse the answers from the response
  const parseResponse = (answerText: { child: ChildResponse, expert: ExpertResponse }): { childMessage: Message, expertMessage: Message } => {
    
    const childObj: ChildResponse = answerText.child;
    const expertObj: ExpertResponse = answerText.expert;
  
    const childMessage: Message = {
      role: 'assistant',
      content: `**Emotion:** ${childObj.emotion}\n\n**Action:** ${childObj.action}\n\n**Saying:** ${childObj.saying}\n\n**Abnormal:** ${childObj.abnormal === "true" ? "Yes" : "No"}`,
      suggestedResponses: expertObj.answer,
    };
  
    const expertMessage: Message = {
      role: 'expert',
      content: `**Reason:** ${expertObj.reason}\n\n**Evaluation:** ${expertObj.evaluate}\n\n**Suggestion:** ${expertObj.suggestion}`,
    };
  
    return { childMessage, expertMessage };
  };
  
  // initializeConversation function
  const initializeConversation = async () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    const profile = profiles.find(p => p.id === selectedProfile);
    if (!scenario || !profile) return;
  
    try {
      setLoading(true);
      setMessages([]); // Clear previous messages
  
      const inputMsg = {
        child_introduction: JSON.stringify(profile),
        time: scenario.time,
        location: scenario.location,
        participant: scenario.participant,
        child_behavior: scenario.child_behavior,
        trigger_event: scenario.trigger_event
      };
  
      const response = await getStarCatResponse(
        t('initialize_conversion'),
        undefined,
        inputMsg
      );
  
      setConversationId(response.conversation_id);
      let rawAnswer = response.answer;
      try {
        // 清理非法空格字符（比如 \u00a0）
        rawAnswer = rawAnswer.replace(/\u00a0/g, ' ');
      
        // 反序列化字符串（注意是嵌套字符串）
        const ans: { child: ChildResponse, expert: ExpertResponse } = JSON.parse(rawAnswer);
      
        console.log('✅ 解码成功！', ans);
      
        const { childMessage, expertMessage } = parseResponse(ans);
        setMessages([childMessage, expertMessage]);
      } catch (err) {
        console.error('❌ 解析失败：', err);
      }
  
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to initialize conversation',
        variant: 'destructive',
      });
      setSelectedScenario(''); // Reset scenario selection on error
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
      setInput('');
  
      // Add user message immediately
      const userMessage: Message = { role: 'user', content: messageContent };
      setMessages(prev => [...prev, userMessage]);
  
      const scenario = scenarios.find(s => s.id === selectedScenario);
      const profile = profiles.find(p => p.id === selectedProfile);
      if (!scenario || !profile) return;
  
      const inputMsg = {
        child_introduction: JSON.stringify(profile),
        time: scenario.time,
        location: scenario.location,
        participant: scenario.participant,
        child_behavior: scenario.child_behavior,
        trigger_event: scenario.trigger_event,
      };
  
      const response = await getStarCatResponse(messageContent, conversationId, inputMsg);
      let rawAnswer = response.answer;
      try {
        // 清理非法空格字符（比如 \u00a0）
        rawAnswer = rawAnswer.replace(/\u00a0/g, ' ');
      
        // 反序列化字符串（注意是嵌套字符串）
        const ans: { child: ChildResponse, expert: ExpertResponse } = JSON.parse(rawAnswer);
      
        console.log('✅ 解码成功！', ans);
      
        const { childMessage, expertMessage } = parseResponse(ans);
        setMessages(prev => [...prev, childMessage, expertMessage]);
      } catch (err) {
        console.error('❌ 解析失败：', err);
      }
  
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
      // Remove the user message if the API call fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
        <h1 className="text-3xl font-bold mb-8 hidden sm:inline-block">{t('title')}</h1>
        
        <Card className="flex flex-col h-full sm:h-[600px]">
          <div className="p-4 border-b space-y-4">
            {selectedProfile && (
              <div>
                <Label htmlFor="scenario">{t('scenario_title')}</Label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('scenario_choose')} />
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
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'expert'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('child_simulation')}</span>
                    </div>
                  )}
                  {message.role === 'expert' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('expert_insight')}</span>
                    </div>
                  )}
                  <ReactMarkdown className="prose dark:prose-invert">
                    {message.content}
                  </ReactMarkdown>
                  {message.suggestedResponses && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="suggestedResponses" className='font-bold text-black'>{t('suggested_responses')}:</Label>
                      {message.suggestedResponses.map((response, i) => (
                        <div
                          key={i}
                          className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-white"
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
                    <span className="text-sm font-medium">{t('child_expert_thinking')}</span>
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

          <div className="p-4 border-t sticky bottom-0 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or select a suggested response..."
                className="flex-1 min-h-[40px] max-h-[200px] px-3 py-2 rounded-md border bg-background resize-none"
                disabled={!selectedProfile || !selectedScenario || loading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!selectedProfile || !selectedScenario || !input.trim() || loading}
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