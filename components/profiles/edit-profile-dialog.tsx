'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  name: string;
  age: number;
  gender?: string;
  diagnosis_age?: number;
  diagnosis_source?: string;
  severity?: string;
  behavior_features: Record<string, any>;
  sensory_preferences: Record<string, any>;
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
  const [gender, setGender] = useState(profile.gender || 'male');
  const [diagnosisAge, setDiagnosisAge] = useState(profile.diagnosis_age?.toString() || '1');
  const [diagnosisSource, setDiagnosisSource] = useState(profile.diagnosis_source || 'non-psychologist');
  const [severity, setSeverity] = useState(profile.severity || 'none');
  
  // Behavior indicators
  const [canInitiateConversation, setCanInitiateConversation] = useState(
    profile.behavior_features?.can_initiate_conversation ? 'yes' : 'no'
  );
  const [canExpressNeeds, setCanExpressNeeds] = useState(
    profile.behavior_features?.can_express_needs ? 'yes' : 'no'
  );
  const [hasFriends, setHasFriends] = useState(
    profile.behavior_features?.has_friends ? 'yes' : 'no'
  );
  const [hasSelfStimulation, setHasSelfStimulation] = useState(
    profile.behavior_features?.has_self_stimulation ? 'yes' : 'no'
  );
  const [isInSchool, setIsInSchool] = useState(
    profile.behavior_features?.is_in_school ? 'yes' : 'no'
  );
  const [canPerformDailyTasks, setCanPerformDailyTasks] = useState(
    profile.behavior_features?.can_perform_daily_tasks ? 'yes' : 'no'
  );
  
  // Sensory responses
  const [sensoryResponse, setSensoryResponse] = useState(
    profile.sensory_preferences?.sensory_response || ''
  );
  const [specialInterests, setSpecialInterests] = useState(
    profile.sensory_preferences?.special_interests || ''
  );
  const [environmentalResponse, setEnvironmentalResponse] = useState(
    profile.sensory_preferences?.environmental_response || ''
  );
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(profile.name);
    setAge(profile.age.toString());
    setGender(profile.gender || 'male');
    setDiagnosisAge(profile.diagnosis_age?.toString() || '1');
    setDiagnosisSource(profile.diagnosis_source || 'non-psychologist');
    setSeverity(profile.severity || 'none');
    setCanInitiateConversation(profile.behavior_features?.can_initiate_conversation ? 'yes' : 'no');
    setCanExpressNeeds(profile.behavior_features?.can_express_needs ? 'yes' : 'no');
    setHasFriends(profile.behavior_features?.has_friends ? 'yes' : 'no');
    setHasSelfStimulation(profile.behavior_features?.has_self_stimulation ? 'yes' : 'no');
    setIsInSchool(profile.behavior_features?.is_in_school ? 'yes' : 'no');
    setCanPerformDailyTasks(profile.behavior_features?.can_perform_daily_tasks ? 'yes' : 'no');
    setSensoryResponse(profile.sensory_preferences?.sensory_response || '');
    setSpecialInterests(profile.sensory_preferences?.special_interests || '');
    setEnvironmentalResponse(profile.sensory_preferences?.environmental_response || '');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          age: parseInt(age),
          gender,
          diagnosis_age: parseInt(diagnosisAge),
          diagnosis_source: diagnosisSource,
          severity,
          behavior_features: behaviorFeatures,
          sensory_preferences: sensoryFeatures,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}