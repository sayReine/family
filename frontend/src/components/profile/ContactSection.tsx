import React from 'react';
import { MapPin, Mail, Phone, Info, Lock, Eye } from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';

const ContactSection: React.FC = () => {
  const { profileData, updateContact } = useProfile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateContact({ [name]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <MapPin className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Contact & Location</h2>
          <p className="text-sm text-gray-100 mt-1">
            Optional information to help family members connect with you
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Privacy & Visibility</p>
          <p className="mt-1">
            Administrators may choose what information is visible to other family members. 
            Your email will only be shared with family admins by default.
          </p>
        </div>
      </div>

      {/* Visibility Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <Eye className="w-4 h-4 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Public</p>
            <p className="text-green-700">City, Country</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <Eye className="w-4 h-4 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">Family Only</p>
            <p className="text-yellow-700">Phone</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <Lock className="w-4 h-4 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Admin Only</p>
            <p className="text-red-700">Email, Address</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
                <span className="text-xs text-red-600">(Admin only)</span>
              </div>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="john.smith@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-100 mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Phone Number
                <span className="text-xs text-yellow-600">(Family only)</span>
              </div>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">
          Location Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-100 mb-2">
              <div className="flex items-center gap-2">
                City
                <span className="text-xs text-green-600">(Public)</span>
              </div>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={profileData.city || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="New York"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-100 mb-2">
              <div className="flex items-center gap-2">
                Country
                <span className="text-xs text-green-600">(Public)</span>
              </div>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={profileData.country || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="United States"
            />
          </div>
        </div>

        {/* Full Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-100 mb-2">
            <div className="flex items-center gap-2">
              Full Address
              <span className="text-xs text-gray-500">(optional)</span>
              <span className="text-xs text-red-600">(Admin only)</span>
            </div>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={profileData.address || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="123 Main Street, Apt 4B"
          />
          <p className="mt-1 text-xs text-gray-500">
            Street address is kept private and only visible to family administrators
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Why we collect this information</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Helps family members reconnect and stay in touch</li>
            <li>Useful for organizing family events and reunions</li>
            <li>Provides context for genealogical research</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;