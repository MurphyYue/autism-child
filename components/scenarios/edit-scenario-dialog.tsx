'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { type Scenario } from '@/types/scenario';

interface Profile {
  id: string;
  name: string;
}

interface EditScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: Scenario;
  profile: Profile;
  onSuccess: () => void;
}

export default function EditScenarioDialog({
  open,
  onOpenChange,
  scenario,
  profile,
  onSuccess,
}: EditScenarioDialogProps) {
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [participant, setParticipant] = useState('');
  const [childBehavior, setChildBehavior] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [parentResponse, setParentResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('Scenarios');
  const t2 = useTranslations('Scenarios.create');

  useEffect(() => {
    setTime(scenario.time || '');
    setLocation(scenario.location || '');
    setParticipant(scenario.participant || '');
    setChildBehavior(scenario.child_behavior);
    setTriggerEvent(scenario.trigger_event);
    setParentResponse(scenario.parent_response);
  }, [scenario]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('scenarios')
        .update({
          profile_id: profile.id,
          time,
          location,
          participant,
          child_behavior: childBehavior,
          trigger_event: triggerEvent,
          parent_response: parentResponse
        })
        .eq('id', scenario.id);

      if (error) throw error;
      onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t2("edit_scenario")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">{t2('child_profile')}: {profile.name}</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">{t('scenario_time')}</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              placeholder={t2('enter_time')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('scenario_location')}</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder={t2('enter_location')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant">{t('scenario_participant')}</Label>
            <Input
              id="participant"
              value={participant}
              onChange={(e) => setParticipant(e.target.value)}
              required
              placeholder={t2('enter_participant')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="childBehavior">
              {t('scenario_child_behavior')}
            </Label>
            <Textarea
              id="childBehavior"
              value={childBehavior}
              onChange={(e) => setChildBehavior(e.target.value)}
              rows={3}
              placeholder={t2('enter_behavior')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="triggerEvent">
              {t('scenario_trigger_event')}
            </Label>
            <Textarea
              id="triggerEvent"
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              rows={3}
              placeholder={t2('enter_trigger')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentResponse">
              {t('scenario_parent_response')}
            </Label>
            <Textarea
              id="parentResponse"
              value={parentResponse}
              onChange={(e) => setParentResponse(e.target.value)}
              rows={3}
              placeholder={t2('enter_response')}
            />
          </div>


          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? t2('saving') : t2('save_changes')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}