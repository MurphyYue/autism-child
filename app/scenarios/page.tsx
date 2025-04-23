"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import CreateScenarioDialog from "@/components/scenarios/create-scenario-dialog";
import ScenarioList from "@/components/scenarios/scenario-list";
import AIScenarioChat from "@/components/scenarios/ai-scenario-chat";
import { useTranslations } from 'next-intl';
import { type Scenario } from "@/types/scenario";

interface Profile {
  id: string;
  name: string;
}

export default function ScenariosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Scenarios');
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile>({ id: "", name: "" });
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchProfiles();
  }, [user, router]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setProfiles(data[0] || { id: "", name: "" });
      fetchScenarios(data[0].id);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchScenarios = async (id: string | undefined = undefined) => {
    try {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq('profile_id', id || profiles.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioCreated = () => {
    setIsCreateOpen(false);
    setIsChatOpen(false);
    fetchScenarios(profiles.id);
    toast({
      title: t('success'),
      description: t('scenario_created_success'),
    });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('loading')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6 box-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold hidden sm:inline-block">{t('title')}</h1>
          <div className="flex-1 flex justify-between sm:justify-end gap-6">
            <Button
              onClick={() => setIsCreateOpen(true)}
              disabled={!profiles?.name}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('add_manually')}
            </Button>
            {/* Desktop AI Assistant Button */}
            <Button
              onClick={() => {
                setIsChatOpen(true);
              }}
              disabled={!profiles?.name}
              className="hidden sm:flex"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              {t('ai_assistant')}
            </Button>
            {/* Mobile Chat Navigation Button */}
            <Button
              onClick={() => {
                router.push('/scenarios/chat');
              }}
              disabled={!profiles?.name}
              className="sm:hidden flex"
              variant="secondary"
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              {t('ai_assistant')}
            </Button>
          </div>
        </div>

        {!profiles?.name ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('create_profile_first')}</p>
          </Card>
        ) : scenarios.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('no_scenarios_yet')}</p>
          </Card>
        ) : (
          <ScenarioList
            scenarios={scenarios}
            profile={profiles}
            onUpdate={fetchScenarios}
          />
        )}
        <AIScenarioChat
          profile={profiles}
          onScenarioCreated={handleScenarioCreated}
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
        />
        <CreateScenarioDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          profile={profiles}
          onSuccess={handleScenarioCreated}
        />
      </div>
    </div>
  );
}
