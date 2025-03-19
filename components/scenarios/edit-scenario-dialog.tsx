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
}

interface EditScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: Scenario;
  profiles: Profile[];
  onSuccess: () => void;
}

export default function EditScenarioDialog({
  open,
  onOpenChange,
  scenario,
  profiles,
  onSuccess,
}: EditScenarioDialogProps) {
  const [profileId, setProfileId] = useState(scenario.profile_id);
  const [title, setTitle] = useState(scenario.title);
  const [description, setDescription] = useState(scenario.description);
  const [location, setLocation] = useState(scenario.location);
  const [triggers, setTriggers] = useState('');
  const [responses, setResponses] = useState('');
  const [outcome, setOutcome] = useState(scenario.outcome);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setProfileId(scenario.profile_id);
    setTitle(scenario.title);
    setDescription(scenario.description);
    setLocation(scenario.location);
    setTriggers(formatJson(scenario.triggers));
    setResponses(formatJson(scenario.responses));
    setOutcome(scenario.outcome);
  }, [scenario]);

  const formatJson = (json: Record<string, any>): string => {
    return Object.entries(json)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const parseTextToJson = (text: string): Record<string, string> => {
    const result: Record<string, string> = {};
    text.split('\n').forEach((line) => {
      const [key, value] = line.split(':').map((s) => s.trim());
      if (key && value) {
        result[key] = value;
      }
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('scenarios')
        .update({
          profile_id: profileId,
          title,
          description,
          location,
          triggers: parseTextToJson(triggers),
          responses: parseTextToJson(responses),
          outcome,
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Scenario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Child Profile</Label>
            <Select value={profileId} onValueChange={setProfileId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a child profile" />
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

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="triggers">
              Triggers (one per line, format: trigger: description)
            </Label>
            <Textarea
              id="triggers"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responses">
              Responses (one per line, format: action: result)
            </Label>
            <Textarea
              id="responses"
              value={responses}
              onChange={(e) => setResponses(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Final Outcome</Label>
            <Textarea
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}