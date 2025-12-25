import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useBackendAuth } from './BackendAuthContext';

export type ProfileStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProfileData {
  // Section 1: Identity
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  nicknames: string[];
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  isDeceased: boolean;
  dateOfDeath?: string;

  // Section 2: Contact & Location
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;

  // Section 3: Family Relationships
  biologicalFatherId?: string;
  biologicalMotherId?: string;
  spouses: Array<{
    spouseId?: string;
    spouseName?: string;
    marriageDate?: string;
    status: 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  }>;

  // Section 4: Children
  childrenIds: string[];

  // Section 5: Life & Story
  bio?: string;
  occupation?: string;
  stories: Array<{
    id: string;
    title: string;
    content: string;
    date?: string;
  }>;
  profilePhoto?: string;

  // Metadata
  status: ProfileStatus;
  rejectionReason?: string;
  
  // Registration fields (only for new users)
  password?: string;
  confirmPassword?: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  updateIdentity: (data: Partial<ProfileData>) => void;
  updateContact: (data: Partial<ProfileData>) => void;
  updateFamilyRelationships: (data: Partial<ProfileData>) => void;
  updateChildren: (childrenIds: string[]) => void;
  updateLifeStory: (data: Partial<ProfileData>) => void;
  addNickname: (nickname: string) => void;
  removeNickname: (nickname: string) => void;
  addSpouse: (spouse: ProfileData['spouses'][0]) => void;
  removeSpouse: (index: number) => void;
  addStory: (story: ProfileData['stories'][0]) => void;
  removeStory: (id: string) => void;
  submitProfile: () => Promise<void>;
  saveDraft: () => Promise<void>;
  registerAndSubmit: () => Promise<void>;
  resetProfile: () => void;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const initialProfileData: ProfileData = {
  firstName: '',
  lastName: '',
  maidenName: '',
  nicknames: [],
  gender: undefined,
  dateOfBirth: '',
  isDeceased: false,
  dateOfDeath: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  address: '',
  biologicalFatherId: undefined,
  biologicalMotherId: undefined,
  spouses: [],
  childrenIds: [],
  bio: '',
  occupation: '',
  stories: [],
  profilePhoto: '',
  status: 'DRAFT',
  rejectionReason: '',
  password: '',
  confirmPassword: '',
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [currentSection, setCurrentSection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Get auth context
  const { token, register, login } = useBackendAuth();

  const updateIdentity = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const updateContact = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const updateFamilyRelationships = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const updateChildren = (childrenIds: string[]) => {
    setProfileData(prev => ({ ...prev, childrenIds }));
  };

  const updateLifeStory = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const addNickname = (nickname: string) => {
    if (nickname.trim() && !profileData.nicknames.includes(nickname.trim())) {
      setProfileData(prev => ({
        ...prev,
        nicknames: [...prev.nicknames, nickname.trim()],
      }));
    }
  };

  const removeNickname = (nickname: string) => {
    setProfileData(prev => ({
      ...prev,
      nicknames: prev.nicknames.filter(n => n !== nickname),
    }));
  };

  const addSpouse = (spouse: ProfileData['spouses'][0]) => {
    setProfileData(prev => ({
      ...prev,
      spouses: [...prev.spouses, spouse],
    }));
  };

  const removeSpouse = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      spouses: prev.spouses.filter((_, i) => i !== index),
    }));
  };

  const addStory = (story: ProfileData['stories'][0]) => {
    setProfileData(prev => ({
      ...prev,
      stories: [...prev.stories, story],
    }));
  };

  const removeStory = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      stories: prev.stories.filter(s => s.id !== id),
    }));
  };

  const buildPayload = (status: 'DRAFT' | 'PENDING') => {
    return {
      // Section 1: Identity
      firstName: profileData.firstName,
      middleName: profileData.middleName || null,
      lastName: profileData.lastName,
      maidenName: profileData.maidenName || null,
      nicknames: profileData.nicknames,
      gender: profileData.gender || null,
      dateOfBirth: profileData.dateOfBirth || null,
      isDeceased: profileData.isDeceased,
      dateOfDeath: profileData.isDeceased ? profileData.dateOfDeath || null : null,
      
      // Section 2: Contact & Location
      email: profileData.email || null,
      phone: profileData.phone || null,
      address: profileData.address || null,
      city: profileData.city || null,
      state: profileData.state || null,
      country: profileData.country || null,
      
      // Section 3: Family Relationships
      biologicalFatherId: profileData.biologicalFatherId || null,
      biologicalMotherId: profileData.biologicalMotherId || null,
      spouses: profileData.spouses,
      
      // Section 4: Children
      childrenIds: profileData.childrenIds,
      
      // Section 5: Life & Story
      bio: profileData.bio || null,
      occupation: profileData.occupation || null,
      stories: profileData.stories,
      profilePhoto: profileData.profilePhoto || null,
      
      // Status
      status
    };
  };

  const saveDraft = async () => {
    console.log('=== saveDraft called ===');
    console.log('Token exists:', !!token);
    console.log('Is new user:', isNewUser);
    
    if (!token) {
      throw new Error('You must be logged in to save a draft. Please register or login first.');
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const payload = buildPayload('DRAFT');

      console.log('Saving draft with payload:', payload);

      const response = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        throw new Error(errorData.error || `Failed to save draft: ${response.status}`);
      }
      
      const savedData = await response.json();
      console.log('Draft saved successfully:', savedData);
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitProfile = async () => {
    console.log('=== submitProfile called ===');
    console.log('Token exists:', !!token);
    
    if (!token) {
      throw new Error('You must be logged in to submit a profile. Please register or login first.');
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const payload = buildPayload('PENDING');

      console.log('Submitting profile with payload:', payload);

      const response = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Submit response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submit error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        throw new Error(errorData.error || `Failed to submit profile: ${response.status}`);
      }
      
      setProfileData(prev => ({ ...prev, status: 'PENDING' }));
      const result = await response.json();
      console.log('Profile submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerAndSubmit = async () => {
    console.log('=== registerAndSubmit called ===');

    // Validation (password validation already done in ProfilePage)
    if (!profileData.email) {
      throw new Error('Email is required for registration');
    }

    if (!profileData.firstName || !profileData.lastName) {
      throw new Error('First name and last name are required');
    }

    setIsLoading(true);
    try {
      console.log('Step 1: Registering user with email:', profileData.email);
      
      // Step 1: Register the user
      await register(profileData.email, profileData.password);
      
      console.log('Step 2: User registered successfully, now submitting profile');
      
      // Step 2: Submit the profile (token is now available from register)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const payload = buildPayload('PENDING');
      
      // Get the token from localStorage after registration
      const newToken = localStorage.getItem('token');
      
      if (!newToken) {
        throw new Error('Registration succeeded but no token was received');
      }

      console.log('Submitting profile with payload:', payload);

      const response = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Profile submission response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile submission error:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        throw new Error(errorData.error || `Failed to submit profile: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Registration and profile submission complete:', result);
      
      setProfileData(prev => ({ ...prev, status: 'PENDING' }));
    } catch (error) {
      console.error('Error in registerAndSubmit:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetProfile = () => {
    setProfileData(initialProfileData);
    setCurrentSection(1);
    setIsNewUser(false);
  };

  const value: ProfileContextType = {
    profileData,
    isNewUser,
    setIsNewUser,
    updateIdentity,
    updateContact,
    updateFamilyRelationships,
    updateChildren,
    updateLifeStory,
    addNickname,
    removeNickname,
    addSpouse,
    removeSpouse,
    addStory,
    removeStory,
    submitProfile,
    saveDraft,
    registerAndSubmit,
    resetProfile,
    currentSection,
    setCurrentSection,
    isLoading,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};