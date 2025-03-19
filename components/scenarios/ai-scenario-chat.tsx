'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

interface Profile {
  id: string;
  name: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIScenarioChatProps {
  profiles: Profile[];
  onScenarioCreated: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIScenarioChat({
  profiles,
  onScenarioCreated,
  open,
  onOpenChange,
}: AIScenarioChatProps) {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedProfile) return;

    try {
      setLoading(true);
      const userMessage = input.trim();
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

      // TODO: Replace with actual Dify API call
      const response = await mockDifyAPI(userMessage);

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
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

  // Mock Dify API call - Replace with actual implementation
  const mockDifyAPI = async (message: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock response based on user input
    if (message.toLowerCase().includes('help')) {
      return "I'll help you document a scenario. Could you tell me when this happened and where it took place?";
    }
    
    return "I understand. Could you provide more details about what triggered this behavior and how you responded?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
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
                  : 'bg-muted'
              }`}
            >
              {message.role === 'assistant' && (
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
  );
}