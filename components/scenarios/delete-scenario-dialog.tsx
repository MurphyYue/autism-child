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
import { useTranslations } from 'next-intl';
import { type Scenario } from '@/types/scenario';
import { useAuth } from '@/components/auth-provider';

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
  const t = useTranslations('Scenarios');
  const { user } = useAuth();
  const handleDelete = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    // check if the row is existing and belongs to the user's profile
    const { data, error: fetchError } = await supabase
      .from('scenarios')
      .select('id, profile_id')
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

    // Verify ownership through profile user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.profile_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      toast({
        title: 'Error',
        description: 'You do not have permission to delete this scenario',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', scenario.id)
        .eq('profile_id', data.profile_id); // Additional safety check
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
          <AlertDialogTitle>{t('delete_dialog_title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete_dialog_description', { name: scenario.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}