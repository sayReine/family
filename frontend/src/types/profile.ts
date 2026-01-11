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

export interface ProfileContextType {
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
