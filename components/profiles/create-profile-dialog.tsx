'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateProfileDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProfileDialogProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sensoryPreferences, setSensoryPreferences] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [interests, setInterests] = useState('');
  const [routines, setRoutines] = useState('');
  const [triggers, setTriggers] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        name,
        age: parseInt(age),
        sensory_preferences: parseTextToJson(sensoryPreferences),
        communication_style: parseTextToJson(communicationStyle),
        interests: parseTextToJson(interests),
        routines: parseTextToJson(routines),
        triggers: parseTextToJson(triggers),
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
    setName('');
    setAge('');
    setSensoryPreferences('');
    setCommunicationStyle('');
    setInterests('');
    setRoutines('');
    setTriggers('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
          </div>

          <Tabs defaultValue="sensory" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="sensory">Sensory</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="routines">Routines</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
            </TabsList>

            <TabsContent value="sensory">
              <div className="space-y-2">
                <Label htmlFor="sensoryPreferences">
                  Sensory Preferences (one per line, format: type: description)
                </Label>
                <Textarea
                  id="sensoryPreferences"
                  value={sensoryPreferences}
                  onChange={(e) => setSensoryPreferences(e.target.value)}
                  placeholder="Sound: Sensitive to loud noises&#10;Touch: Prefers soft textures&#10;Light: Avoids bright lights"
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="communication">
              <div className="space-y-2">
                <Label htmlFor="communicationStyle">
                  Communication Style (one per line, format: aspect: description)
                </Label>
                <Textarea
                  id="communicationStyle"
                  value={communicationStyle}
                  onChange={(e) => setCommunicationStyle(e.target.value)}
                  placeholder="Verbal: Uses single words&#10;Nonverbal: Points to objects&#10;AAC: Uses picture cards"
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="interests">
              <div className="space-y-2">
                <Label htmlFor="interests">
                  Special Interests (one per line, format: interest: details)
                </Label>
                <Textarea
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Trains: Knows all types and models&#10;Numbers: Can count to 1000&#10;Music: Enjoys classical pieces"
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="routines">
              <div className="space-y-2">
                <Label htmlFor="routines">
                  Daily Routines (one per line, format: time/activity: description)
                </Label>
                <Textarea
                  id="routines"
                  value={routines}
                  onChange={(e) => setRoutines(e.target.value)}
                  placeholder="Morning: Needs specific breakfast routine&#10;Bedtime: Follows strict order of activities&#10;Transitions: Requires 5-minute warnings"
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="triggers">
              <div className="space-y-2">
                <Label htmlFor="triggers">
                  Known Triggers (one per line, format: trigger: response)
                </Label>
                <Textarea
                  id="triggers"
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  placeholder="Sudden Changes: May become anxious&#10;Crowded Places: May cover ears&#10;New Foods: May refuse to eat"
                  rows={5}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}