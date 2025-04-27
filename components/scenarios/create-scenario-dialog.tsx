"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  name: string;
}

interface CreateScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess: () => void;
}

export default function CreateScenarioDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: CreateScenarioDialogProps) {
  const t = useTranslations('Scenarios.create');
  const t2 = useTranslations('Scenarios');
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [participant, setParticipant] = useState("");
  const [childBehavior, setChildBehavior] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("");
  const [parentResponse, setParentResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("scenarios").insert({
        profile_id: profile.id,
        title,
        time,
        location,
        participant,
        child_behavior: childBehavior,
        trigger_event: triggerEvent,
        parent_response: parentResponse,
      });

      if (error) throw error;
      toast({
        title: t('success'),
        description: t('success'),
      });
      onSuccess();
      resetForm();
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

  const resetForm = () => {
    setTitle("");
    setTime("");
    setLocation("");
    setParticipant("");
    setChildBehavior("");
    setTriggerEvent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">{t('child_profile')}: {profile.name}</Label>
          </div>

          <div className="space-y-2">
            <Label>{t2('scenario_title')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('enter_title')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t2('scenario_time')}</Label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder={t('enter_time')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t2('scenario_location')}</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('enter_location')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t2('scenario_participant')}</Label>
            <Input
              value={participant}
              onChange={(e) => setParticipant(e.target.value)}
              placeholder={t('enter_participant')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t2('scenario_child_behavior')}</Label>
            <Textarea
              value={childBehavior}
              onChange={(e) => setChildBehavior(e.target.value)}
              placeholder={t('enter_behavior')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t2('scenario_trigger_event')}</Label>
            <Textarea
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              placeholder={t('enter_trigger')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t2('scenario_parent_response')}</Label>
            <Textarea
              value={parentResponse}
              onChange={(e) => setParentResponse(e.target.value)}
              placeholder={t('enter_response')}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t2('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('creating') : t('create_scenario')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
