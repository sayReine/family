import React, { useState, useEffect } from "react";
import { Users, Shield, Activity, UserPlus, CheckCircle } from "lucide-react";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UserManagement {
  id: string;
  email: string;
  role: "GUEST" | "MEMBER" | "ADMIN";
  personId?: string;
  person?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  maidenName?: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  isDeceased: boolean;
  email?: string;
  phone?: string;
  bio?: string;
  occupation?: string;
  profileStatus: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalPeople: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  maidenName: string;
  gender: string;
  dateOfBirth: string;
  isDeceased: boolean;
  dateOfDeath: string;
  biologicalFatherId: string;
  biologicalMotherId: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  occupation: string;
  bio: string;
  profilePhoto: string;
}

const AdminPage: React.FC = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useBackendAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"users" | "people" | "register">(
    "users"
  );
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPeople: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoType, setPhotoType] = useState<"upload" | "url">("url");
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [approvedUser, setApprovedUser] = useState<UserManagement | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate, isAuthLoading]);

  // Fetch data on mount and when tab changes
  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      fetchStats();
      if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "people") {
        fetchPeople();
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
      console.error("Failed to fetch stats:", error);
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
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/persons`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPeople(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch people:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to approve this user? This will change their role to MEMBER."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: "MEMBER" }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApprovedUser(data.user);
        setShowApprovalConfirm(true);
        fetchUsers(); // Refresh the users list
      } else {
        const error = await response.json();
        alert(`Failed to approve user: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Failed to approve user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason || !reason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: false }),
        }
      );

      if (response.ok) {
        alert(
          "User rejected and deactivated. They will not be able to log in."
        );
        fetchUsers(); // Refresh the users list
      } else {
        const error = await response.json();
        alert(`Failed to reject user: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to reject user:", error);
      alert("Failed to reject user. Please try again.");
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
              <h1 className="text-3xl font-bold text-gray-50">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Manage users, profiles, and family tree data
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium">Total People</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPeople}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </div>
            </button>

            <button
              onClick={() => setActiveTab("people")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "people"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                All People
              </div>
            </button>

            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
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
          {activeTab === "users" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading users...</p>
                </div>
              ) : users.filter((user) => user.role === "GUEST").length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No guest user registrations found
                  </p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .filter((user) => user.role === "GUEST")
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                Role: {user.role}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.person ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.person.firstName}{" "}
                                    {user.person.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Person ID: {user.personId}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  No person linked
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                Created:{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                              {user.lastLoginAt && (
                                <div>
                                  Last Login:{" "}
                                  {new Date(
                                    user.lastLoginAt
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveUser(user.id)}
                                  disabled={isLoading}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.id)}
                                  disabled={isLoading}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
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
          {activeTab === "register" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Manual Family Member Registration
                </h2>
                <p className="text-gray-600">
                  Add family members directly to the database
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                {/* Identity Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maiden Name
                      </label>
                      <input
                        type="text"
                        name="maidenName"
                        value={formData.maidenName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900">
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isDeceased"
                          checked={formData.isDeceased}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Deceased</span>
                      </label>
                    </div>
                    {formData.isDeceased && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label>
                        <input
                          type="date"
                          name="dateOfDeath"
                          value={formData.dateOfDeath}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Family Relationships Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Family Relationships
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biological Father
                      </label>
                      <input
                        type="text"
                        placeholder="Search for father..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biological Mother
                      </label>
                      <input
                        type="text"
                        placeholder="Search for mother..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Suggested Generation:</strong> Generation 1 (No
                      parents selected)
                    </p>
                  </div>
                </div>

                {/* Contact & Location Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email ?? ''}
                        onChange={handleInputChange}
                        disabled={formData.isDeceased}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone ?? ''}
                        onChange={handleInputChange}
                        disabled={formData.isDeceased}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address ?? ''}
                        onChange={handleInputChange}
                        disabled={formData.isDeceased}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city ?? ''}
                        onChange={handleInputChange}
                        disabled={formData.isDeceased}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state ?? ''}
                        onChange={handleInputChange}
                        disabled={formData.isDeceased}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country ?? ''}
                        onChange={handleInputChange}
                        disabled={formData.isDeceased}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Life & Story Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Life & Story
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        placeholder="Brief biography..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Photo
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="photoType"
                              value="url"
                              checked={photoType === "url"}
                              onChange={(e) =>
                                setPhotoType(e.target.value as "upload" | "url")
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              Online URL
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="photoType"
                              value="upload"
                              checked={photoType === "upload"}
                              onChange={(e) =>
                                setPhotoType(e.target.value as "upload" | "url")
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              Upload from PC
                            </span>
                          </label>
                        </div>
                        {photoType === "url" ? (
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
          {activeTab === "people" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-gray-500">Loading people...</p>
                </div>
              ) : people.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No people found.
                </p>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      All People ({people.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {people.map((person) => (
                            <tr key={person.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {person.firstName} {person.middleName || ""}{" "}
                                  {person.lastName}
                                </div>
                                {person.maidenName && (
                                  <div className="text-sm text-gray-500">
                                    Maiden: {person.maidenName}
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  ID: {person.id}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {person.email && (
                                  <div className="text-sm text-gray-900">
                                    {person.email}
                                  </div>
                                )}
                                {person.phone && (
                                  <div className="text-sm text-gray-500">
                                    {person.phone}
                                  </div>
                                )}
                                {!person.email && !person.phone && (
                                  <div className="text-sm text-gray-500">
                                    No contact info
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    person.isDeceased
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {person.isDeceased ? "Deceased" : "Living"}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  Profile: {person.profileStatus}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  person.createdAt
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalConfirm && approvedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                User Profile Confirmed
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-3">
                  Profile Successfully Approved
                </p>
                <p className="text-sm text-green-800">
                  The user's role has been changed from GUEST to MEMBER. They
                  now have full access to the family tree.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  User Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{approvedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-green-600">
                      {approvedUser.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        approvedUser.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {approvedUser.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {approvedUser.person && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {approvedUser.person.firstName}{" "}
                          {approvedUser.person.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Person ID:</span>
                        <span className="font-medium text-gray-500">
                          {approvedUser.personId}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(approvedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {approvedUser.lastLoginAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium">
                        {new Date(
                          approvedUser.lastLoginAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowApprovalConfirm(false);
                  setApprovedUser(null);
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
