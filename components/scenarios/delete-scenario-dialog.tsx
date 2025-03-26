'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Scenario {
  id: string;
  profile_id: string;
  title: string;
  time: string;
  participant: string;
  location: string;
  child_behavior: string;
  trigger_event: string;
  responses: string;
}

interface DeleteScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: Scenario;
  onSuccess: () => void;
}

export default function DeleteScenarioDialog({
  open,
  onOpenChange,
  scenario,
  onSuccess,
}: DeleteScenarioDialogProps) {
  const { toast } = useToast();
  const handleDelete = async () => {
    // check if the row is existing
    const { data, error: fetchError } = await supabase
      .from('scenarios')
      .select('id')
      .eq('id', scenario.id)
      .single();
    if (fetchError || !data) {
      toast({
        title: 'Error',
        description: 'Scenario not found',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', scenario.id);
      if (error) throw error;

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the scenario "{scenario.title}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}