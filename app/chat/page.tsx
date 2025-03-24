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
import { getDifyResponse } from '@/lib/dify';
import { Send, Bot, Brain, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

interface Profile {
  id: string;
  name: string;
  age?: number;
  behavior_features?: Record<string, any>;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  triggers?: Record<string, any>;
  responses?: Record<string, any>;
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

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, age, behavior_features')
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('id, title, description, triggers, responses')
        .eq('profile_id', selectedProfile)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const initializeConversation = async () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    const profile = profiles.find(p => p.id === selectedProfile);
    if (!scenario || !profile) return;

    try {
      const response = await getDifyResponse(
        'Initialize conversation',
        undefined,
        {
          profile_name: profile.name,
          profile_age: profile.age,
          profile_features: profile.behavior_features,
          scenario_title: scenario.title,
          scenario_description: scenario.description,
          scenario_triggers: scenario.triggers,
          scenario_responses: scenario.responses,
        }
      );

      setConversationId(response.conversation_id);
      
      const initialMessage: Message = {
        role: 'assistant',
        content: response.answer,
        suggestedResponses: response.suggestions,
      };

      setMessages([initialMessage]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to initialize conversation',
        variant: 'destructive',
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content: string = input) => {
    if ((!content.trim() && !input.trim()) || !selectedProfile || !selectedScenario) return;

    const messageContent = content.trim() || input.trim();
    
    try {
      setLoading(true);
      setInput('');
      setMessages(prev => [...prev, { role: 'user', content: messageContent }]);

      // Get response from Dify API
      const response = await getDifyResponse(messageContent, conversationId);

      // Child's response
      const childResponse: Message = {
        role: 'assistant',
        content: response.answer,
        suggestedResponses: response.suggestions,
      };
      setMessages(prev => [...prev, childResponse]);

      // Expert insight (you might want to use a different Dify application/prompt for this)
      const expertResponse = await getDifyResponse(
        `Analyze this interaction: ${messageContent}\nChild's response: ${response.answer}`,
        undefined,
        { role: 'expert' }
      );

      const expertMessage: Message = {
        role: 'expert',
        content: expertResponse.answer,
      };
      setMessages(prev => [...prev, expertMessage]);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simulated Conversation</h1>
        
        <Card className="flex flex-col h-[600px]">
          <div className="p-4 border-b space-y-4">
            <div>
              <Label htmlFor="profile">Select Child Profile</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile && (
              <div>
                <Label htmlFor="scenario">Select Scenario</Label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a scenario" />
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
                      <span className="text-sm font-medium">Child Simulation</span>
                    </div>
                  )}
                  {message.role === 'expert' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">Expert Insight</span>
                    </div>
                  )}
                  <ReactMarkdown className="prose dark:prose-invert">
                    {message.content}
                  </ReactMarkdown>
                  {message.suggestedResponses && (
                    <div className="mt-3 space-y-2">
                      {message.suggestedResponses.map((response, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => handleSend(response)}
                          disabled={loading}
                        >
                          {response}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
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