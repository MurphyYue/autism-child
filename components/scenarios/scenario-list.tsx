'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import EditScenarioDialog from './edit-scenario-dialog';
import DeleteScenarioDialog from './delete-scenario-dialog';

interface Profile {
  id: string;
  name: string;
}

interface Scenario {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  location: string;
  triggers: Record<string, any>;
  responses: Record<string, any>;
  outcome: string;
  created_at: string;
}

interface ScenarioListProps {
  scenarios: Scenario[];
  profiles: Profile[];
  onUpdate: () => void;
}

export default function ScenarioList({ scenarios, profiles, onUpdate }: ScenarioListProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const getProfileName = (profileId: string) => {
    return profiles.find((p) => p.id === profileId)?.name || 'Unknown';
  };

  const handleEdit = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsEditOpen(true);
  };

  const handleDelete = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsDeleteOpen(true);
  };

  const handleScenarioUpdated = () => {
    setIsEditOpen(false);
    setSelectedScenario(null);
    onUpdate();
  };

  const handleScenarioDeleted = () => {
    setIsDeleteOpen(false);
    setSelectedScenario(null);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">{scenario.title}</h2>
                <span className="text-sm text-gray-500">
                  ({getProfileName(scenario.profile_id)})
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {format(new Date(scenario.created_at), 'PPP')} at {scenario.location}
              </p>
              <p className="text-gray-700 dark:text-gray-300">{scenario.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(scenario)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(scenario)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {Object.entries(scenario.triggers).length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Triggers:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {Object.entries(scenario.triggers).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Object.entries(scenario.responses).length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Responses:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {Object.entries(scenario.responses).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scenario.outcome && (
              <div>
                <h3 className="font-medium mb-2">Outcome:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {scenario.outcome}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}

      {selectedScenario && (
        <>
          <EditScenarioDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            scenario={selectedScenario}
            profiles={profiles}
            onSuccess={handleScenarioUpdated}
          />
          <DeleteScenarioDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            scenario={selectedScenario}
            onSuccess={handleScenarioDeleted}
          />
        </>
      )}
    </div>
  );
}