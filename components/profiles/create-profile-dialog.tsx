'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Profile');
  const [name, setName] = useState('');
  const [age, setAge] = useState('1');
  const [gender, setGender] = useState('male');
  const [diagnosisAge, setDiagnosisAge] = useState('1');
  const [diagnosisSource, setDiagnosisSource] = useState('non-psychologist');
  const [severity, setSeverity] = useState('none');
  
  // Behavior indicators
  const [canInitiateConversation, setCanInitiateConversation] = useState('');
  const [canExpressNeeds, setCanExpressNeeds] = useState('');
  const [hasFriends, setHasFriends] = useState('');
  const [hasSelfStimulation, setHasSelfStimulation] = useState('');
  const [isInSchool, setIsInSchool] = useState('');
  const [canPerformDailyTasks, setCanPerformDailyTasks] = useState('');
  
  // Sensory responses
  const [sensoryResponse, setSensoryResponse] = useState('');
  const [specialInterests, setSpecialInterests] = useState('');
  const [environmentalResponse, setEnvironmentalResponse] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const behaviorFeatures = {
        can_initiate_conversation: canInitiateConversation,
        can_express_needs: canExpressNeeds,
        has_friends: hasFriends,
        has_self_stimulation: hasSelfStimulation,
        is_in_school: isInSchool,
        can_perform_daily_tasks: canPerformDailyTasks,
      };

      const sensoryFeatures = {
        sensory_response: sensoryResponse,
        special_interests: specialInterests,
        environmental_response: environmentalResponse,
      };

      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        name,
        age: parseInt(age),
        gender,
        diagnosis_age: parseInt(diagnosisAge),
        diagnosis_source: diagnosisSource,
        severity,
        behavior_features: behaviorFeatures,
        sensory_preferences: sensoryFeatures,
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

  const resetForm = () => {
    setName('');
    setAge('1');
    setGender('male');
    setDiagnosisAge('1');
    setDiagnosisSource('non-psychologist');
    setSeverity('none');
    setCanInitiateConversation('yes');
    setCanExpressNeeds('yes');
    setHasFriends('yes');
    setHasSelfStimulation('yes');
    setIsInSchool('yes');
    setCanPerformDailyTasks('yes');
    setSensoryResponse('');
    setSpecialInterests('');
    setEnvironmentalResponse('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('create_dialog_title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  placeholder={t('enter_name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="w-24">
                <Label htmlFor="age">{t('age')}</Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setAge(Math.max(1, parseInt(age) - 1).toString())}
                  >
                    -
                  </Button>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    className="h-10 w-14 text-center mx-1"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setAge((parseInt(age) + 1).toString())}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="gender">{t('gender')}</Label>
              <RadioGroup
                id="gender"
                value={gender}
                onValueChange={setGender}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">{t('male')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">{t('female')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">{t('other')}</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="diagnosis_age">{t('diagnosis_age')}</Label>
              <Input
                id="diagnosis_age"
                type="number"
                min="1"
                value={diagnosisAge}
                onChange={(e) => setDiagnosisAge(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="diagnosis_source">{t('diagnosis_source')}</Label>
              <RadioGroup
                id="diagnosis_source"
                value={diagnosisSource}
                onValueChange={setDiagnosisSource}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="psychologist" id="psychologist" />
                  <Label htmlFor="psychologist">{t('psychologist')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-psychologist" id="non-psychologist" />
                  <Label htmlFor="non-psychologist">{t('non-psychologist')}</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="severity">{t('severity')}</Label>
              <RadioGroup
                id="severity"
                value={severity}
                onValueChange={setSeverity}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mild" id="mild" />
                  <Label htmlFor="mild">{t('mild')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">{t('moderate')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severe" id="severe" />
                  <Label htmlFor="severe">{t('severe')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">{t('none')}</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">{t('behavior_assessment')}</h3>
              <div className="space-y-4">
                <div>
                  <Label>{t('can_initiate_conversation')}</Label>
                  <RadioGroup
                    value={canInitiateConversation}
                    onValueChange={setCanInitiateConversation}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="initiate-yes" />
                      <Label htmlFor="initiate-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="initiate-no" />
                      <Label htmlFor="initiate-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t('can_express_needs')}</Label>
                  <RadioGroup
                    value={canExpressNeeds}
                    onValueChange={setCanExpressNeeds}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="express-yes" />
                      <Label htmlFor="express-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="express-no" />
                      <Label htmlFor="express-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t('has_friends')}</Label>
                  <RadioGroup
                    value={hasFriends}
                    onValueChange={setHasFriends}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="friends-yes" />
                      <Label htmlFor="friends-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="friends-no" />
                      <Label htmlFor="friends-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t('has_self_stimulation')}</Label>
                  <RadioGroup
                    value={hasSelfStimulation}
                    onValueChange={setHasSelfStimulation}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="stim-yes" />
                      <Label htmlFor="stim-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="stim-no" />
                      <Label htmlFor="stim-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t('is_in_school')}</Label>
                  <RadioGroup
                    value={isInSchool}
                    onValueChange={setIsInSchool}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="school-yes" />
                      <Label htmlFor="school-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="school-no" />
                      <Label htmlFor="school-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t('can_perform_daily_tasks')}</Label>
                  <RadioGroup
                    value={canPerformDailyTasks}
                    onValueChange={setCanPerformDailyTasks}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="daily-yes" />
                      <Label htmlFor="daily-yes">{t('yes')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="daily-no" />
                      <Label htmlFor="daily-no">{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">{t('sensory_environmental_response')}</h3>
              <div>
                <Label htmlFor="sensoryResponse">{t('sensory_response')}</Label>
                <Textarea
                  id="sensoryResponse"
                  value={sensoryResponse}
                  onChange={(e) => setSensoryResponse(e.target.value)}
                  placeholder={t('please_briefly_describe')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="specialInterests">{t('special_interests')}</Label>
                <Textarea
                  id="specialInterests"
                  value={specialInterests}
                  onChange={(e) => setSpecialInterests(e.target.value)}
                  placeholder={t('please_briefly_describe')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="environmentalResponse">{t('environmental_response')}</Label>
                <Textarea
                  id="environmentalResponse"
                  value={environmentalResponse}
                  onChange={(e) => setEnvironmentalResponse(e.target.value)}
                  placeholder={t('please_briefly_describe')}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('creating') : t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}