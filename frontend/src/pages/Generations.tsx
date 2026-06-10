import React, { useState, useEffect } from 'react';
import { personsAPI } from '../services/api';
import { GitBranch } from 'lucide-react';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  isDeceased: boolean;
  profilePhoto?: string;
  biologicalFatherId?: string;
  biologicalMotherId?: string;
}

interface GenerationGroup {
  label: string;
  members: Person[];
}

function groupByGeneration(persons: Person[]): GenerationGroup[] {
  // Assign generation depth via BFS from roots (no parents)
  const map = new Map(persons.map(p => [p.id, p]));
  const genMap = new Map<string, number>();

  const visited = new Set<string>();
  const queue: { id: string; gen: number }[] = [];

  // Roots = no parents in this set
  for (const p of persons) {
    const hasFather = p.biologicalFatherId && map.has(p.biologicalFatherId);
    const hasMother = p.biologicalMotherId && map.has(p.biologicalMotherId);
    if (!hasFather && !hasMother) {
      queue.push({ id: p.id, gen: 1 });
    }
  }

  if (queue.length === 0) {
    // Fallback: group by birth decade
    const groups: Record<string, Person[]> = {};
    for (const p of persons) {
      const year = p.dateOfBirth ? Math.floor(new Date(p.dateOfBirth).getFullYear() / 10) * 10 : 0;
      const label = year ? `${year}s` : 'Unknown';
      if (!groups[label]) groups[label] = [];
      groups[label].push(p);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, members]) => ({ label, members }));
  }

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    genMap.set(id, gen);

    const person = map.get(id);
    if (!person) continue;

    // Push children
    for (const p of persons) {
      if (!visited.has(p.id) && (p.biologicalFatherId === id || p.biologicalMotherId === id)) {
        queue.push({ id: p.id, gen: gen + 1 });
      }
    }
  }

  // Any unvisited persons default to gen 1
  for (const p of persons) {
    if (!genMap.has(p.id)) genMap.set(p.id, 1);
  }

  const groups: Record<number, Person[]> = {};
  for (const p of persons) {
    const gen = genMap.get(p.id) ?? 1;
    if (!groups[gen]) groups[gen] = [];
    groups[gen].push(p);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([gen, members]) => ({
      label: `Generation ${gen}`,
      members
    }));
}

const Generations: React.FC = () => {
  const [groups, setGroups] = useState<GenerationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personsAPI.getPersons().then(data => {
      const persons = data.people ?? data;
      setGroups(groupByGeneration(persons));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (groups.length === 0) return (
    <div className="text-center py-20">
      <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400">No persons in the family tree yet</p>
    </div>
  );

  const colors = [
    'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
    'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
    'border-green-400 bg-green-50 dark:bg-green-900/20',
    'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    'border-red-400 bg-red-50 dark:bg-red-900/20',
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Generations</h1>

      <div className="space-y-8">
        {groups.map((group, idx) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-1 flex-1 rounded-full ${colors[idx % colors.length].split(' ')[0].replace('border', 'bg')}`} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {group.label}
                <span className="ml-2 text-sm font-normal text-gray-500">({group.members.length})</span>
              </h2>
              <div className={`h-1 flex-1 rounded-full ${colors[idx % colors.length].split(' ')[0].replace('border', 'bg')}`} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.members.map(person => {
                const birthYear = person.dateOfBirth
                  ? new Date(person.dateOfBirth).getFullYear()
                  : null;
                return (
                  <div
                    key={person.id}
                    className={`border-l-4 rounded-lg p-3 ${colors[idx % colors.length]}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {person.profilePhoto ? (
                          <img src={person.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">
                            {person.firstName[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {person.firstName} {person.lastName}
                        </p>
                        {birthYear && (
                          <p className="text-xs text-gray-500">
                            b. {birthYear}{person.isDeceased ? ' †' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Generations;
