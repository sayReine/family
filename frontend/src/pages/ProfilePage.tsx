import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Save, Send, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { ProfileProvider, useProfile } from '../contexts/ProfileContext';
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
    isLoading,
  } = useProfile();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

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
      await saveDraft();
      alert('Draft saved successfully!');
    } catch (error) {
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      await submitProfile();
      setShowSubmitConfirm(false);
      alert('Profile submitted for review!');
    } catch (error) {
      alert('Failed to submit profile. Please try again.');
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
              <h1 className="text-3xl font-bold text-gray-50">Profile Information</h1>
              <p className="text-gray-50 mt-1">Complete your profile to join the family tree</p>
            </div>
            {getStatusBadge()}
          </div>

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
            className="flex items-center gap-2 px-6 py-3  text-white rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {/* Center Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>

            {currentSection === sections.length && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
                Submit for Review
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Submit Profile for Review</h3>
              </div>

              <div className="space-y-4 text-gray-700">
                <p>You're about to submit your profile for administrator review.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">What happens next?</p>
                  <ul className="mt-2 space-y-2 text-sm text-blue-800">
                    <li>• Your profile will be reviewed by a family administrator</li>
                    <li>• You'll be notified once it's approved or if changes are needed</li>
                    <li>• After approval, you'll appear in the family tree</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600">
                  You can still save as draft and make changes before submitting.
                </p>
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
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Submitting...' : 'Submit Profile'}
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