'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import CreateScenarioDialog from '@/components/scenarios/create-scenario-dialog';
import ScenarioList from '@/components/scenarios/scenario-list';
import AIScenarioChat from '@/components/scenarios/ai-scenario-chat';

interface Profile {
  id: string;
  name: string;
}

interface Scenario {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  location: string;
  triggers: Record<string, any>;
  responses: Record<string, any>;
  outcome: string;
  created_at: string;
}

export default function ScenariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchProfiles();
    fetchScenarios();
  }, [user, router]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
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

  const handleScenarioCreated = () => {
    setIsCreateOpen(false);
    setIsChatOpen(false);
    fetchScenarios();
    toast({
      title: 'Success',
      description: 'Scenario created successfully',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading scenarios...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Structured Scenarios</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              disabled={profiles.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manually
            </Button>
            <Button
              onClick={() => {
                setActiveTab('chat');
                setIsChatOpen(true);
              }}
              disabled={profiles.length === 0}
              variant="secondary"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>

        {profiles.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please create a child profile first before adding scenarios.
            </p>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">Scenarios List</TabsTrigger>
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              {scenarios.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No scenarios yet. Click one of the buttons above to create one.
                  </p>
                </Card>
              ) : (
                <ScenarioList
                  scenarios={scenarios}
                  profiles={profiles}
                  onUpdate={fetchScenarios}
                />
              )}
            </TabsContent>
            <TabsContent value="chat">
              <AIScenarioChat
                profiles={profiles}
                onScenarioCreated={handleScenarioCreated}
                open={isChatOpen}
                onOpenChange={setIsChatOpen}
              />
            </TabsContent>
          </Tabs>
        )}

        <CreateScenarioDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          profiles={profiles}
          onSuccess={handleScenarioCreated}
        />
      </div>
    </div>
  );
}