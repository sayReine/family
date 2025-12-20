import React, { useState } from 'react';
import { BookOpen, Briefcase, Camera, Plus, X, Upload } from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';

const LifeStorySection: React.FC = () => {
  const { profileData, updateLifeStory, addStory, removeStory } = useProfile();
  
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateLifeStory({ [name]: value });
  };

  const handleStoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStory(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStory = () => {
    if (newStory.title && newStory.content) {
      addStory({
        id: Date.now().toString(),
        ...newStory,
      });
      setNewStory({ title: '', content: '', date: '' });
      setShowStoryForm(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to server and get URL
      const reader = new FileReader();
      reader.onload = (event) => {
        updateLifeStory({ profilePhoto: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Life & Story</h2>
          <p className="text-sm text-gray-100 mt-1">
            Share your story and make the family tree meaningful
          </p>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Profile Photo
        </h3>

        <div className="flex items-start gap-6">
          {/* Photo Preview */}
          <div className="flex-shrink-0">
            {profileData.profilePhoto ? (
              <div className="relative group">
                <img
                  src={profileData.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                />
                <button
                  onClick={() => updateLifeStory({ profilePhoto: '' })}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Photo
              </div>
            </label>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> All photos go through admin approval before being displayed publicly. 
                This ensures appropriate and family-friendly content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">
          Short Biography
        </h3>
        
        <div>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Tell us about yourself... Where were you born? What are your interests? What's important to you?"
          />
          <p className="mt-1 text-xs text-gray-500">
            {profileData.bio?.length || 0} / 500 characters
          </p>
        </div>
      </div>

      {/* Occupation */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Occupation
        </h3>

        <input
          type="text"
          id="occupation"
          name="occupation"
          value={profileData.occupation || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Software Engineer, Teacher, Retired Doctor"
        />
      </div>

      {/* Stories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">
            Family Stories
          </h3>
          {!showStoryForm && (
            <button
              onClick={() => setShowStoryForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Story
            </button>
          )}
        </div>

        <p className="text-sm text-gray-300">
          Share memorable moments, family traditions, or interesting experiences. 
          Stories can be added one at a time and help preserve family history.
        </p>

        {/* Existing Stories */}
        {profileData.stories.length > 0 && (
          <div className="space-y-3">
            {profileData.stories.map((story) => (
              <div key={story.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{story.title}</h4>
                    {story.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(story.date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-100 mt-2">{story.content}</p>
                  </div>
                  <button
                    onClick={() => removeStory(story.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Story Form */}
        {showStoryForm && (
          <div className="p-4 bg-gray-800 border border-gray-200 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Story Title
              </label>
              <input
                type="text"
                name="title"
                value={newStory.title}
                onChange={handleStoryChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., My First Day at School, Family Vacation 1995"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Date (optional)
              </label>
              <input
                type="date"
                name="date"
                value={newStory.date}
                onChange={handleStoryChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Story Content
              </label>
              <textarea
                name="content"
                value={newStory.content}
                onChange={handleStoryChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Share your story..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddStory}
                disabled={!newStory.title || !newStory.content}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Story
              </button>
              <button
                onClick={() => {
                  setShowStoryForm(false);
                  setNewStory({ title: '', content: '', date: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-100 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900">💡 Helpful Tip</p>
        <p className="text-sm text-blue-800 mt-1">
          The more details you share, the richer your family history becomes. 
          Stories and photos help future generations understand who you are and preserve your legacy.
        </p>
      </div>
    </div>
  );
};

export default LifeStorySection;