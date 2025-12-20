import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
}

interface ProfileContextType {
  profileData: ProfileData;
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
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [currentSection, setCurrentSection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  const saveDraft = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // Format data for API
      const payload = {
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
        
        // Section 4: Children (handled via relationships in backend)
        childrenIds: profileData.childrenIds,
        
        // Section 5: Life & Story
        bio: profileData.bio || null,
        occupation: profileData.occupation || null,
        stories: profileData.stories,
        profilePhoto: profileData.profilePhoto || null,
        
        // Status
        status: 'DRAFT'
      };

      const response = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save draft');
      }
      
      const savedData = await response.json();
      console.log('Draft saved:', savedData);
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // Format data for API
      const payload = {
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
        
        // Section 4: Children (handled via relationships in backend)
        childrenIds: profileData.childrenIds,
        
        // Section 5: Life & Story
        bio: profileData.bio || null,
        occupation: profileData.occupation || null,
        stories: profileData.stories,
        profilePhoto: profileData.profilePhoto || null,
        
        // Status
        status: 'PENDING'
      };

      const response = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit profile');
      }
      
      setProfileData(prev => ({ ...prev, status: 'PENDING' }));
      const result = await response.json();
      console.log('Profile submitted:', result);
    } catch (error) {
      console.error('Error submitting profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetProfile = () => {
    setProfileData(initialProfileData);
    setCurrentSection(1);
  };

  const value: ProfileContextType = {
    profileData,
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