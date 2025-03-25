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
  const [age, setAge] = useState('1');
  const [gender, setGender] = useState('male');
  const [diagnosisAge, setDiagnosisAge] = useState('1');
  const [diagnosisSource, setDiagnosisSource] = useState('non-psychologist');
  const [severity, setSeverity] = useState('none');
  
  // Behavior indicators
  const [canInitiateConversation, setCanInitiateConversation] = useState('yes');
  const [canExpressNeeds, setCanExpressNeeds] = useState('yes');
  const [hasFriends, setHasFriends] = useState('yes');
  const [hasSelfStimulation, setHasSelfStimulation] = useState('yes');
  const [isInSchool, setIsInSchool] = useState('yes');
  const [canPerformDailyTasks, setCanPerformDailyTasks] = useState('yes');
  
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
        can_initiate_conversation: canInitiateConversation === 'yes',
        can_express_needs: canExpressNeeds === 'yes',
        has_friends: hasFriends === 'yes',
        has_self_stimulation: hasSelfStimulation === 'yes',
        is_in_school: isInSchool === 'yes',
        can_perform_daily_tasks: canPerformDailyTasks === 'yes',
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
          <DialogTitle>Create Child Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="w-24">
                <Label htmlFor="age">Age</Label>
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
              <div className="w-32">
                <Label>Gender</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>First Diagnosis Age</Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setDiagnosisAge(Math.max(1, parseInt(diagnosisAge) - 1).toString())}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    className="h-10 w-14 text-center mx-1"
                    value={diagnosisAge}
                    onChange={(e) => setDiagnosisAge(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setDiagnosisAge((parseInt(diagnosisAge) + 1).toString())}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <Label>Diagnosis Source</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border"
                  value={diagnosisSource}
                  onChange={(e) => setDiagnosisSource(e.target.value)}
                >
                  <option value="non-psychologist">Non-Psychologist</option>
                  <option value="psychologist">Psychologist</option>
                  <option value="specialist">Specialist</option>
                </select>
              </div>
              <div className="flex-1">
                <Label>Severity</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Behavioral Assessment</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Can initiate or respond to others?</Label>
                  <RadioGroup
                    value={canInitiateConversation}
                    onValueChange={setCanInitiateConversation}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="initiate-yes" />
                      <Label htmlFor="initiate-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="initiate-no" />
                      <Label htmlFor="initiate-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Can fully express their needs?</Label>
                  <RadioGroup
                    value={canExpressNeeds}
                    onValueChange={setCanExpressNeeds}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="express-yes" />
                      <Label htmlFor="express-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="express-no" />
                      <Label htmlFor="express-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Has regular friends or teachers?</Label>
                  <RadioGroup
                    value={hasFriends}
                    onValueChange={setHasFriends}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="friends-yes" />
                      <Label htmlFor="friends-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="friends-no" />
                      <Label htmlFor="friends-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Has self-stimulatory behaviors?</Label>
                  <RadioGroup
                    value={hasSelfStimulation}
                    onValueChange={setHasSelfStimulation}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="stim-yes" />
                      <Label htmlFor="stim-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="stim-no" />
                      <Label htmlFor="stim-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Currently attending school?</Label>
                  <RadioGroup
                    value={isInSchool}
                    onValueChange={setIsInSchool}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="school-yes" />
                      <Label htmlFor="school-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="school-no" />
                      <Label htmlFor="school-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Can perform basic daily activities?</Label>
                  <RadioGroup
                    value={canPerformDailyTasks}
                    onValueChange={setCanPerformDailyTasks}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="daily-yes" />
                      <Label htmlFor="daily-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="daily-no" />
                      <Label htmlFor="daily-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Sensory and Environmental Response</h3>
              
              <div>
                <Label htmlFor="sensoryResponse">
                  Does the child have any special reactions to sounds, lights, or touch?
                </Label>
                <Textarea
                  id="sensoryResponse"
                  value={sensoryResponse}
                  onChange={(e) => setSensoryResponse(e.target.value)}
                  placeholder="Please briefly describe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="specialInterests">
                  Does the child have any special interests, including colors, toys, or activities?
                </Label>
                <Textarea
                  id="specialInterests"
                  value={specialInterests}
                  onChange={(e) => setSpecialInterests(e.target.value)}
                  placeholder="Please briefly describe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="environmentalResponse">
                  Does the child show discomfort or emotional reactions in certain environments?
                </Label>
                <Textarea
                  id="environmentalResponse"
                  value={environmentalResponse}
                  onChange={(e) => setEnvironmentalResponse(e.target.value)}
                  placeholder="Please briefly describe"
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}