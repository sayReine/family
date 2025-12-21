import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  Shield,
  Activity
} from 'lucide-react';
import { useBackendAuth } from '../contexts/BackendAuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type ProfileStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface PendingProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  status: ProfileStatus;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface UserManagement {
  id: string;
  email: string;
  role: 'GUEST' | 'MEMBER' | 'ADMIN';
  personId?: string;
  person?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

interface Stats {
  totalUsers: number;
  totalPeople: number;
  pendingProfiles: number;
  approvedProfiles: number;
  rejectedProfiles: number;
}

const AdminPage: React.FC = () => {
  const { user, token, isAuthenticated } = useBackendAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'people'>('pending');
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPeople: 0,
    pendingProfiles: 0,
    approvedProfiles: 0,
    rejectedProfiles: 0,
  });

  const [selectedProfile, setSelectedProfile] = useState<PendingProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | 'ALL'>('ALL');

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch data on mount and when tab changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStats();
      if (activeTab === 'pending') {
        fetchPendingProfiles();
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchStats = async () => {
    try {
      // For now, we'll calculate stats from the data we fetch
      // In production, you'd want a dedicated stats endpoint
      const [usersRes, peopleRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/person?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok && peopleRes.ok) {
        const usersData = await usersRes.json();
        const peopleData = await peopleRes.json();

        setStats({
          totalUsers: usersData.length || 0,
          totalPeople: peopleData.pagination?.total || 0,
          pendingProfiles: 0, // Will be calculated from pending profiles
          approvedProfiles: 0,
          rejectedProfiles: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchPendingProfiles = async () => {
    setIsLoading(true);
    try {
      // We need to fetch all people and filter by status
      const response = await fetch(`${API_URL}/api/person?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // For now, we'll show all people - ideally backend should filter by status
        setPendingProfiles(data.people || []);
        
        // Update stats
        const pending = (data.people || []).filter((p: PendingProfile) => p.status === 'PENDING').length;
        const approved = (data.people || []).filter((p: PendingProfile) => p.status === 'APPROVED').length;
        const rejected = (data.people || []).filter((p: PendingProfile) => p.status === 'REJECTED').length;
        
        setStats(prev => ({
          ...prev,
          pendingProfiles: pending,
          approvedProfiles: approved,
          rejectedProfiles: rejected,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch pending profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // This endpoint doesn't exist yet - you'll need to add it to your backend
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to approve this profile?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/profiles/${profileId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Profile approved successfully!');
        fetchPendingProfiles();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to approve profile: ${error.error}`);
      }
    } catch (error) {
      console.error('Error approving profile:', error);
      alert('Failed to approve profile');
    }
  };

  const handleRejectProfile = (profile: PendingProfile) => {
    setSelectedProfile(profile);
    setShowRejectionModal(true);
  };

  const submitRejection = async () => {
    if (!selectedProfile || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/profiles/${selectedProfile.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        alert('Profile rejected successfully');
        setShowRejectionModal(false);
        setSelectedProfile(null);
        setRejectionReason('');
        fetchPendingProfiles();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to reject profile: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting profile:', error);
      alert('Failed to reject profile');
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: 'GUEST' | 'MEMBER' | 'ADMIN') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        alert('User role updated successfully!');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to update user role: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const getStatusBadge = (status: ProfileStatus) => {
    const config = {
      DRAFT: { icon: Clock, text: 'Draft', color: 'bg-gray-100 text-gray-700' },
      PENDING: { icon: Clock, text: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      APPROVED: { icon: CheckCircle, text: 'Approved', color: 'bg-green-100 text-green-700' },
      REJECTED: { icon: XCircle, text: 'Rejected', color: 'bg-red-100 text-red-700' },
    };

    const { icon: Icon, text, color } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {text}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const config = {
      GUEST: 'bg-gray-100 text-gray-700',
      MEMBER: 'bg-blue-100 text-blue-700',
      ADMIN: 'bg-purple-100 text-purple-700',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[role as keyof typeof config]}`}>
        {role}
      </span>
    );
  };

  const filteredProfiles = pendingProfiles.filter(profile => {
    const matchesSearch = 
      profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || profile.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-700 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-50">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage users, profiles, and family tree data</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium">Total People</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPeople}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingProfiles}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedProfiles}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedProfiles}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Profiles
                {stats.pendingProfiles > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {stats.pendingProfiles}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </div>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'people'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                All People
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {activeTab === 'pending' && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ProfileStatus | 'ALL')}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DRAFT">Draft</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Pending Profiles Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading profiles...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No profiles found</p>
                </div>
              ) : (
                filteredProfiles.map((profile) => (
                  <div key={profile.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {profile.firstName} {profile.middleName && `${profile.middleName} `}{profile.lastName}
                          </h3>
                          {getStatusBadge(profile.status)}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {profile.email && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Email:</span> {profile.email}
                            </p>
                          )}
                          {profile.dateOfBirth && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Date of Birth:</span>{' '}
                              {new Date(profile.dateOfBirth).toLocaleDateString()}
                            </p>
                          )}
                          {profile.user && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">User:</span> {profile.user.email} ({profile.user.role})
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Submitted:</span>{' '}
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/person/${profile.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>

                        {profile.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveProfile(profile.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>

                            <button
                              onClick={() => handleRejectProfile(profile)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">User management interface coming soon...</p>
            </div>
          )}

          {/* People Tab */}
          {activeTab === 'people' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">All people view coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reject Profile</h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                You're about to reject the profile for:{' '}
                <strong>
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </strong>
              </p>
              <p className="text-sm text-gray-600">
                Please provide a reason for rejection. This will be shown to the user.
              </p>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedProfile(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Reject Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;