import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, GitBranch, Check, X, UserMinus, ArrowLeft, Clock } from 'lucide-react';
import { familiesAPI } from '../services/api';
import { useBackendAuth } from '../hooks/UseBackendAuth';

interface Member {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
  user: {
    id: string;
    email: string;
    person: {
      firstName: string;
      lastName: string;
      profilePhoto: string | null;
    } | null;
  } | null;
}

interface JoinRequest {
  id: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    person: { firstName: string; lastName: string; profilePhoto: string | null } | null;
  } | null;
}

interface FamilyDetail {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  members: Member[];
  joinRequests: JoinRequest[];
}

const FamilyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useBackendAuth();
  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');

  const myMembership = family?.members.find(m => m.userId === user?.id);
  const isAdmin = myMembership?.role === 'ADMIN' || user?.role === 'ADMIN';

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [familyData] = await Promise.all([familiesAPI.get(id)]);
      setFamily(familyData);
      if (isAdmin || user?.role === 'ADMIN') {
        const reqs = await familiesAPI.getRequests(id).catch(() => []);
        setRequests(reqs);
      }
    } catch {
      setError('Failed to load family details');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin, user?.role]);

  useEffect(() => { load(); }, [load]);

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    if (!id) return;
    try {
      await familiesAPI.processRequest(id, requestId, action);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (action === 'accept') load();
    } catch {
      setError('Failed to process request');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id || !window.confirm('Remove this member?')) return;
    try {
      await familiesAPI.removeMember(id, memberId);
      load();
    } catch {
      setError('Failed to remove member');
    }
  };

  const getDisplayName = (member: Member | JoinRequest) => {
    if (member.user?.person) {
      return `${member.user.person.firstName} ${member.user.person.lastName}`;
    }
    return member.user?.email ?? 'Unknown';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (error || !family) return (
    <div className="text-center py-20 text-red-500">{error || 'Family not found'}</div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/families')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Families
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{family.name}</h1>
            {family.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">{family.description}</p>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
              <Users className="w-4 h-4" />
              <span>{family.members.length} member{family.members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/families/${id}/tree`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <GitBranch className="w-4 h-4" />
            View Tree
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Members ({family.members.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Join Requests
            {requests.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {requests.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-2">
          {family.members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {member.user?.person?.profilePhoto ? (
                    <img src={member.user.person.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-indigo-600 font-semibold text-sm">
                      {getDisplayName(member)[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{getDisplayName(member)}</p>
                  <p className="text-xs text-gray-500">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  member.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {member.role}
                </span>
                {isAdmin && member.userId !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Requests tab */}
      {activeTab === 'requests' && isAdmin && (
        <div className="space-y-2">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No pending join requests
            </div>
          ) : (
            requests.map(req => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                      {getDisplayName(req)[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{getDisplayName(req)}</p>
                    <p className="text-xs text-gray-500">{req.user?.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req.id, 'accept')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, 'reject')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FamilyDetail;
