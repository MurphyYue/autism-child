'use client';

import { useState } from 'react';
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

interface CreateScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  onSuccess: () => void;
}

export default function CreateScenarioDialog({
  open,
  onOpenChange,
  profiles,
  onSuccess,
}: CreateScenarioDialogProps) {
  const [profileId, setProfileId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [triggers, setTriggers] = useState('');
  const [responses, setResponses] = useState('');
  const [outcome, setOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('scenarios').insert({
        profile_id: profileId,
        title,
        description,
        location,
        triggers: parseTextToJson(triggers),
        responses: parseTextToJson(responses),
        outcome,
      });

      if (error) throw error;

      onSuccess();
      resetForm();
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

  const resetForm = () => {
    setProfileId('');
    setTitle('');
    setDescription('');
    setLocation('');
    setTriggers('');
    setResponses('');
    setOutcome('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Scenario</DialogTitle>
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
              placeholder="Brief title for the scenario"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what happened"
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
              placeholder="Where did this happen?"
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
              placeholder="Noise: Loud unexpected sound&#10;Change: Sudden schedule change&#10;Social: Too many people nearby"
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
              placeholder="Distraction: Helped calm down&#10;Deep breathing: Reduced anxiety&#10;Quiet space: Allowed recovery"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Final Outcome</Label>
            <Textarea
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="How did the situation resolve?"
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
              {loading ? 'Creating...' : 'Create Scenario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}