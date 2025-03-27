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
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [participant, setParticipant] = useState("");
  const [childBehavior, setChildBehavior] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

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
        responses: response,
      });

      if (error) throw error;
      onSuccess();
      resetForm();
    } catch (error) {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const parseTextToJson = (text: string): Record<string, string> => {
    const result: Record<string, string> = {};
    text.split("\n").forEach((line) => {
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) {
        result[key] = value;
      }
    });
    return result;
  };

  const resetForm = () => {
    setTitle("");
    setTime("");
    setLocation("");
    setParticipant("");
    setChildBehavior("");
    setTriggerEvent("");
    setResponse("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-h-[76vh] overflow-y-auto md:max-w-[725px] touch-pan-y dialog-scroll">
        <DialogHeader>
          <DialogTitle>Create New Scenario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Child Profile: {profile.name}</Label>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Participant</Label>
            <Input
              value={participant}
              onChange={(e) => setParticipant(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Child Behavior (key: value, one per line)</Label>
            <Textarea
              value={childBehavior}
              onChange={(e) => setChildBehavior(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Trigger Event (key: value, one per line)</Label>
            <Textarea
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Response (key: value, one per line)</Label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
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
              {loading ? "Creating..." : "Create Scenario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
