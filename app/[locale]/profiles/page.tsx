"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import CreateProfileDialog from "@/components/profiles/create-profile-dialog";
import EditProfileDialog from "@/components/profiles/edit-profile-dialog";
import Link from "next/link";
import {useTranslations} from 'next-intl';
import { type Profile } from "@/types/profile";

export default function ProfilesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user, userLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Profile');

  useEffect(() => {
    if (!user && !userLoading) {
      // User is not logged in, redirect to login page and add a parameter to redirect back to the current page
      router.push("/auth/login?redirectTo=/profiles");
      return;
    }

    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: t("get_profile_error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCreated = () => {
    setIsCreateOpen(false);
    fetchProfile();
    toast({
      title: "Success",
      description: t("create_profile_success")
    });
  };

  const handleProfileUpdated = () => {
    setIsEditOpen(false);
    fetchProfile();
    toast({
      title: "Success",
      description: t("update_profile_success"),
    });
  };

  const renderBehaviorStatus = (value: string) => (
    <span
      className={`px-2 py-1 rounded-full text-sm ${
        value === 'yes'
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
    >
      {value === 'yes' ? "Yes" : "No"}
    </span>
  );

  const renderSeverityBadge = (severity: string) => {
    const colors = {
      none: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      mild: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      moderate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      severe: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-sm ${
          colors[severity as keyof typeof colors]
        }`}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const genDiagnosisSource = (source: string | undefined) => {
    if (!source) return t('no_info');
    return t(source);
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 sm:mb-8">
          <div className="hidden sm:inline-block">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
          </div>
          {!profile && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('create_profile')}
            </Button>
          )}
        </div>

        {!profile ? (
          <div className="p-6 text-center" style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(184, 196, 255, 0.6), transparent 25%), " +
              "radial-gradient(circle at 70% 60%, rgba(255, 184, 222, 0.6), transparent 25%), " +
              "radial-gradient(circle at 40% 80%, rgba(184, 255, 214, 0.6), transparent 25%), " +
              "radial-gradient(circle at 80% 30%, rgba(255, 222, 184, 0.6), transparent 25%)",
          }}>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('no_profile')}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('create_profile')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6" style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(184, 196, 255, 0.6), transparent 25%), " +
                "radial-gradient(circle at 70% 60%, rgba(255, 184, 222, 0.6), transparent 25%), " +
                "radial-gradient(circle at 40% 80%, rgba(184, 255, 214, 0.6), transparent 25%), " +
                "radial-gradient(circle at 80% 30%, rgba(255, 222, 184, 0.6), transparent 25%)",
            }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    {profile.name}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <span>{t('age')} {profile.age}</span>
                    <span>
                      {t('gender')}{" "}
                      {profile.gender
                        ? profile.gender.charAt(0).toUpperCase() +
                          profile.gender.slice(1)
                        : ""}
                    </span>
                    <span>{t('diagnosis_age')} {profile.diagnosis_age || "N/A"}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t('diagnosis_info')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('diagnosis_source')}:
                        </span>
                        <span className="font-medium">
                          {genDiagnosisSource(profile.diagnosis_source)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('severity')}:
                        </span>
                        {renderSeverityBadge(profile.severity || "none")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t('behavior_assessment')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('can_initiate_conversation')}:
                        </span>
                        {renderBehaviorStatus(
                          profile.behavior_features?.can_initiate_conversation
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('can_express_needs')}:
                        </span>
                        {renderBehaviorStatus(
                          profile.behavior_features?.can_express_needs
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('has_friends')}:
                        </span>
                        {renderBehaviorStatus(
                          profile.behavior_features?.has_friends
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('has_self_stimulation')}:
                        </span>
                        {renderBehaviorStatus(
                          profile.behavior_features?.has_self_stimulation
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('attending_school')}:
                        </span>
                        {renderBehaviorStatus(
                          profile.behavior_features?.is_in_school
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('can_perform_daily_tasks')}:
                        </span>
                        {renderBehaviorStatus(
                          profile.behavior_features?.can_perform_daily_tasks
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                    {t('sensory_response')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('special_reactions')}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {profile.sensory_preferences?.sensory_response ||
                            t('no_info')}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('special_interests')}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {profile.sensory_preferences?.special_interests ||
                            t('no_info')}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('environmental_response')}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {profile.sensory_preferences
                            ?.environmental_response ||
                            t('no_info')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button asChild className="hidden sm:inline-block">
                <Link href="/scenarios">{t('create_scenarios')}</Link>
              </Button>
            </div>
          </div>
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
