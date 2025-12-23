import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, Send, CheckCircle, XCircle, Clock, AlertCircle, UserPlus } from 'lucide-react';
import { ProfileProvider, useProfile } from '../contexts/ProfileContext';
import { useBackendAuth } from '../contexts/BackendAuthContext';
import IdentitySection from '../components/profile/IdentitySection';
import ContactSection from '../components/profile/ContactSection';
import FamilyRelationshipsSection from '../components/profile/FamilyRelationshipSection';
import ChildrenSection from '../components/profile/ChildrenSection';
import LifeStorySection from '../components/profile/LifeStorySection';

const sections = [
  { id: 1, title: 'Identity', required: true },
  { id: 2, title: 'Contact & Location', required: false },
  { id: 3, title: 'Family Relationships', required: true },
  { id: 4, title: 'Children', required: false },
  { id: 5, title: 'Life & Story', required: false },
];

const ProfilePageContent: React.FC = () => {
  const {
    currentSection,
    setCurrentSection,
    profileData,
    submitProfile,
    saveDraft,
    registerAndSubmit,
    isLoading,
    isNewUser,
    setIsNewUser,
    updateContact,
  } = useProfile();

  const { isAuthenticated } = useBackendAuth();
  
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Detect if user is new (not authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setIsNewUser(true);
    }
  }, [isAuthenticated, setIsNewUser]);

  const handleNext = () => {
    if (currentSection < sections.length) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    try {
      console.log('handleSaveDraft called');
      await saveDraft();
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('handleSaveDraft error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save draft: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isNewUser) {
        // Validate registration fields
        if (!profileData.email) {
          alert('Email is required for registration');
          return;
        }
        
        if (!password) {
          alert('Password is required for registration');
          return;
        }
        
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        if (password.length < 6) {
          alert('Password must be at least 6 characters long');
          return;
        }

        // Update profile data with password
        updateContact({ password, confirmPassword });
        
        // Register and submit
        await registerAndSubmit();
        alert('Registration successful! Your profile has been submitted for review.');
      } else {
        // Just submit profile for existing users
        await submitProfile();
        alert('Profile submitted for review!');
      }
      
      setShowSubmitConfirm(false);
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to submit: ${errorMessage}`);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      DRAFT: { icon: Clock, text: 'Draft', color: 'bg-gray-100 text-gray-700' },
      PENDING: { icon: Clock, text: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
      APPROVED: { icon: CheckCircle, text: 'Approved', color: 'bg-green-100 text-green-700' },
      REJECTED: { icon: XCircle, text: 'Rejected', color: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[profileData.status];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </div>
    );
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return <IdentitySection />;
      case 2:
        return <ContactSection />;
      case 3:
        return <FamilyRelationshipsSection />;
      case 4:
        return <ChildrenSection />;
      case 5:
        return <LifeStorySection />;
      default:
        return <IdentitySection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-50">
                {isNewUser ? 'Register & Create Profile' : 'Profile Information'}
              </h1>
              <p className="text-gray-50 mt-1">
                {isNewUser 
                  ? 'Create your account and join the family tree'
                  : 'Complete your profile to join the family tree'
                }
              </p>
            </div>
            {!isNewUser && getStatusBadge()}
          </div>

          {/* New User Notice */}
          {isNewUser && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">New User Registration</p>
                <p className="mt-1">You'll need to provide an email and password to create your account. Make sure to use the same email in the Contact section.</p>
              </div>
            </div>
          )}

          {/* Rejection Notice */}
          {profileData.status === 'REJECTED' && profileData.rejectionReason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Profile was rejected</p>
                <p className="mt-1"><strong>Reason:</strong> {profileData.rejectionReason}</p>
                <p className="mt-2">Please make the necessary changes and resubmit.</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-50">
                Section {currentSection} of {sections.length}
              </span>
              <span className="text-sm text-gray-50">
                {Math.round((currentSection / sections.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentSection / sections.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="mt-6 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentSection === section.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.title}
                {section.required && <span className="text-red-500 ml-1">*</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Current Section Content */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          {renderSection()}
        </div>

        {/* Navigation & Actions */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={currentSection === 1}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {/* Center Actions */}
          <div className="flex gap-3">
            {!isNewUser && (
              <button
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Draft
              </button>
            )}

            {currentSection === sections.length && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isNewUser ? <UserPlus className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                {isNewUser ? 'Register & Submit' : 'Submit for Review'}
              </button>
            )}
          </div>

          {/* Next Button */}
          {currentSection < sections.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-24" /> // Spacer for layout
          )}
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  {isNewUser ? <UserPlus className="w-6 h-6 text-green-600" /> : <Send className="w-6 h-6 text-green-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isNewUser ? 'Create Account & Submit Profile' : 'Submit Profile for Review'}
                </h3>
              </div>

              {isNewUser && (
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-3">Create Your Account</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={profileData.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                          placeholder="Email from Contact section"
                        />
                        <p className="text-xs text-gray-500 mt-1">From your Contact section</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Create a password"
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Confirm your password"
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">What happens next?</p>
                  <ul className="mt-2 space-y-2 text-sm text-blue-800">
                    {isNewUser && <li>• Your account will be created</li>}
                    <li>• Your profile will be reviewed by a family administrator</li>
                    <li>• You'll be notified once it's approved or if changes are needed</li>
                    <li>• After approval, you'll appear in the family tree</li>
                  </ul>
                </div>

                {!isNewUser && (
                  <p className="text-sm text-gray-600">
                    You can still save as draft and make changes before submitting.
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || (isNewUser && (!password || !confirmPassword))}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Processing...' : isNewUser ? 'Create & Submit' : 'Submit Profile'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? Contact a family administrator or 
            <button className="text-indigo-600 hover:text-indigo-700 ml-1">
              view our guide
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main component with Provider
const ProfilePage: React.FC = () => {
  return (
    <ProfileProvider>
      <ProfilePageContent />
    </ProfileProvider>
  );
};

export default ProfilePage;