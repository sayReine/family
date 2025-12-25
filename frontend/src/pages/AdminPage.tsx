import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Activity,
  UserPlus
} from 'lucide-react';
import { useBackendAuth } from '../contexts/BackendAuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
}

const AdminPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useBackendAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'people' | 'register'>('users');
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPeople: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoType, setPhotoType] = useState<'upload' | 'url'>('url');

  // Check if user is admin
  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, isAuthLoading]);

  // Fetch data on mount and when tab changes
  useEffect(() => {  
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStats();
      if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
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

            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Register Member
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading users...</p>
                </div>
              ) : users.filter(user => user.role === 'GUEST').length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No guest user registrations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Person Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(user => user.role === 'GUEST').map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">Role: {user.role}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.person ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.person.firstName} {user.person.lastName}
                                </div>
                                <div className="text-sm text-gray-500">Person ID: {user.personId}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No person linked</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                            {user.lastLoginAt && (
                              <div>Last Login: {new Date(user.lastLoginAt).toLocaleDateString()}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Register Tab */}
          {activeTab === 'register' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manual Family Member Registration</h2>
                <p className="text-gray-600">Add family members directly to the database</p>
              </div>

              <form className="max-w-2xl mx-auto space-y-6">
                {/* Identity Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maiden Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900">
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Family Relationships Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Relationships</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Biological Father</label>
                      <input
                        type="text"
                        placeholder="Search for father..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Biological Mother</label>
                      <input
                        type="text"
                        placeholder="Search for mother..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Suggested Generation:</strong> Generation 1 (No parents selected)
                    </p>
                  </div>
                </div>

                {/* Contact & Location Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Life & Story Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Life & Story</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        placeholder="Brief biography..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="photoType"
                              value="url"
                              checked={photoType === 'url'}
                              onChange={(e) => setPhotoType(e.target.value as 'upload' | 'url')}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Online URL</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="photoType"
                              value="upload"
                              checked={photoType === 'upload'}
                              onChange={(e) => setPhotoType(e.target.value as 'upload' | 'url')}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Upload from PC</span>
                          </label>
                        </div>
                        {photoType === 'url' ? (
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                            placeholder="https://example.com/photo.jpg"
                          />
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    Register Family Member
                  </button>
                </div>
              </form>
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
    </div>
  );
};

export default AdminPage;
