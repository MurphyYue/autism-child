'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  name: string;
  age: number;
  behavior_features: Record<string, any>;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess: () => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: EditProfileDialogProps) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [behaviorFeatures, setBehaviorFeatures] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(profile.name);
    setAge(profile.age.toString());
    setBehaviorFeatures(formatBehaviorFeatures(profile.behavior_features));
  }, [profile]);

  const formatBehaviorFeatures = (features: Record<string, any>): string => {
    return Object.entries(features)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const parseBehaviorFeatures = (text: string): Record<string, string> => {
    const features: Record<string, string> = {};
    text.split('\n').forEach((line) => {
      const [key, value] = line.split(':').map((s) => s.trim());
      if (key && value) {
        features[key] = value;
      }
    });
    return features;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          age: parseInt(age),
          behavior_features: parseBehaviorFeatures(behaviorFeatures),
        })
        .eq('id', profile.id);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <Label htmlFor="behaviorFeatures">
              Behavior Features (one per line, format: feature: description)
            </Label>
            <Textarea
              id="behaviorFeatures"
              value={behaviorFeatures}
              onChange={(e) => setBehaviorFeatures(e.target.value)}
              placeholder="Communication: Nonverbal&#10;Interests: Trains and numbers&#10;Sensory: Sensitive to loud sounds"
              rows={5}
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