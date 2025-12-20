import React, { useState } from 'react';
import { User, X, Info } from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';

const IdentitySection: React.FC = () => {
  const { profileData, updateIdentity, addNickname, removeNickname } = useProfile();
  const [nicknameInput, setNicknameInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateIdentity({ [name]: checked });
      
      // Clear dateOfDeath if isDeceased is unchecked
      if (name === 'isDeceased' && !checked) {
        updateIdentity({ dateOfDeath: '' });
      }
    } else {
      updateIdentity({ [name]: value });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddNickname = () => {
    if (nicknameInput.trim()) {
      addNickname(nicknameInput);
      setNicknameInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNickname();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Identity Information</h2>
          <p className="text-sm text-white mt-1">
            This information is used to place you correctly in the family tree
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Required fields are marked with *</p>
          <p className="mt-1">This is the minimum information needed to exist in the family tree.</p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-100 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={profileData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="John"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-100 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={profileData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="Smith"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      {/* Maiden Name */}
      <div>
        <label htmlFor="maidenName" className="block text-sm font-medium text-gray-100 mb-2">
          Maiden Name <span className="text-xs text-gray-200">(optional)</span>
        </label>
        <input
          type="text"
          id="maidenName"
          name="maidenName"
          value={profileData.maidenName || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Birth surname if different"
        />
      </div>

      {/* Nicknames */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-50 mb-2">
          Nicknames <span className="text-xs text-gray-200">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="nickname"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add a nickname (press Enter)"
          />
          <button
            type="button"
            onClick={handleAddNickname}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
        
        {/* Nickname chips */}
        {profileData.nicknames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {profileData.nicknames.map((nickname, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-900 rounded-full text-sm"
              >
                {nickname}
                <button
                  type="button"
                  onClick={() => removeNickname(nickname)}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-2 h-2" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gender and Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-100 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={profileData.gender || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border text-gray-100 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled >Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-100 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={profileData.dateOfBirth || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Deceased checkbox */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="isDeceased"
          name="isDeceased"
          checked={profileData.isDeceased}
          onChange={handleChange}
          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <div className="flex-1">
          <label htmlFor="isDeceased" className="block text-sm font-medium text-gray-900 cursor-pointer">
            This person is deceased
          </label>
          <p className="text-xs text-gray-600 mt-1">
            Check this box if the person has passed away
          </p>
        </div>
      </div>

      {/* Date of Death (conditional) */}
      {profileData.isDeceased && (
        <div className="ml-7">
          <label htmlFor="dateOfDeath" className="block text-sm font-medium text-gray-100 mb-2">
            Date of Death
          </label>
          <input
            type="date"
            id="dateOfDeath"
            name="dateOfDeath"
            value={profileData.dateOfDeath || ''}
            onChange={handleChange}
            className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
};

export default IdentitySection;