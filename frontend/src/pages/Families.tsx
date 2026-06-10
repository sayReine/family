import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, LogIn, Check, X, Clock } from 'lucide-react';
import { familiesAPI } from '../services/api';

interface FamilySummary {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  isMember: boolean;
  myRole: 'ADMIN' | 'MEMBER' | null;
}

const Families: React.FC = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<FamilySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingJoins, setPendingJoins] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await familiesAPI.list();
      setFamilies(data);
    } catch {
      setError('Failed to load families');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await familiesAPI.create({ name: newName.trim(), description: newDesc.trim() || undefined });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      load();
    } catch {
      setError('Failed to create family');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (familyId: string) => {
    try {
      await familiesAPI.requestJoin(familyId);
      setPendingJoins(prev => new Set([...prev, familyId]));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send join request');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Families</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Join an existing family or create a new one
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Family
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Create family modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create a New Family</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Family Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="e.g. The Smith Family"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 resize-none"
                  placeholder="A short description of your family..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Families grid */}
      {families.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No families yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {families.map(family => (
            <div
              key={family.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{family.name}</h3>
                  {family.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{family.description}</p>
                  )}
                </div>
                {family.isMember && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    family.myRole === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {family.myRole}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Users className="w-4 h-4" />
                <span>{family.memberCount} member{family.memberCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex gap-2">
                {family.isMember ? (
                  <button
                    onClick={() => navigate(`/families/${family.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" />
                    View Family
                  </button>
                ) : pendingJoins.has(family.id) ? (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm">
                    <Clock className="w-4 h-4" />
                    Request Pending
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoin(family.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Request to Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Families;
