'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import CreateProfileDialog from '@/components/profiles/create-profile-dialog';
import EditProfileDialog from '@/components/profiles/edit-profile-dialog';

interface Profile {
  id: string;
  name: string;
  age: number;
  behavior_features?: Record<string, any>;
  sensory_preferences: Record<string, any>;
  communication_style: Record<string, any>;
  interests: Record<string, any>;
  routines: Record<string, any>;
  triggers: Record<string, any>;
  created_at: string;
}

export default function ProfilesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
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

  const handleProfileCreated = () => {
    setIsCreateOpen(false);
    fetchProfile();
    toast({
      title: 'Success',
      description: 'Profile created successfully',
    });
  };

  const handleProfileUpdated = () => {
    setIsEditOpen(false);
    fetchProfile();
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Child Profile</h1>
          {!profile && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          )}
        </div>

        {!profile ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No profile yet. Click the button above to create one.
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{profile.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Age: {profile.age}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.sensory_preferences && Object.keys(profile.sensory_preferences).length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Sensory Preferences</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(profile.sensory_preferences).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.communication_style && Object.keys(profile.communication_style).length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Communication Style</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(profile.communication_style).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.interests && Object.keys(profile.interests).length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Interests</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(profile.interests).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.routines && Object.keys(profile.routines).length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Daily Routines</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(profile.routines).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.triggers && Object.keys(profile.triggers).length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Known Triggers</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(profile.triggers).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        <CreateProfileDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={handleProfileCreated}
        />

        {profile && (
          <EditProfileDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            profile={profile}
            onSuccess={handleProfileUpdated}
          />
        )}
      </div>
    </div>
  );
}