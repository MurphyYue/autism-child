export interface Profile {
  id: string;
  name: string;
  age: number;
  gender?: string;
  diagnosis_age?: number;
  diagnosis_source?: string;
  severity?: string;
  behavior_features: Record<string, any>;
  sensory_preferences: Record<string, any>;
  created_at?: string;
}