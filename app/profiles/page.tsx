'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import CreateProfileDialog from '@/components/profiles/create-profile-dialog';
import EditProfileDialog from '@/components/profiles/edit-profile-dialog';
import DeleteProfileDialog from '@/components/profiles/delete-profile-dialog';

interface Profile {
  id: string;
  name: string;
  age: number;
  behavior_features: Record<string, any>;
  created_at: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchProfiles();
  }, [user, router]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProfiles(data || []);
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
    fetchProfiles();
    toast({
      title: 'Success',
      description: 'Profile created successfully',
    });
  };

  const handleProfileUpdated = () => {
    setIsEditOpen(false);
    setSelectedProfile(null);
    fetchProfiles();
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
  };

  const handleProfileDeleted = () => {
    setIsDeleteOpen(false);
    setSelectedProfile(null);
    fetchProfiles();
    toast({
      title: 'Success',
      description: 'Profile deleted successfully',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading profiles...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Child Profiles</h1>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Profile
          </Button>
        </div>

        {profiles.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No profiles yet. Click the button above to create one.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Age: {profile.age}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProfile(profile);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProfile(profile);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {Object.entries(profile.behavior_features).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Behavior Features:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                      {Object.entries(profile.behavior_features).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <CreateProfileDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={handleProfileCreated}
        />

        {selectedProfile && (
          <>
            <EditProfileDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              profile={selectedProfile}
              onSuccess={handleProfileUpdated}
            />
            <DeleteProfileDialog
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
              profile={selectedProfile}
              onSuccess={handleProfileDeleted}
            />
          </>
        )}
      </div>
    </div>
  );
}