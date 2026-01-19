export type ProfileStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface ProfileData {
  firstName: string;
  lastName: string;
  nicknames: string[];
  isDeceased: boolean;
  spouses: Array<{ spouseId?: string; spouseName?: string; status: "MARRIED" | "DIVORCED" | "WIDOWED" }>;
  childrenIds: string[];
  stories: Array<{ id: string; title: string; content: string }>;
  status: ProfileStatus;
  password: string;
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
  addSpouse: (spouse: ProfileData["spouses"][0]) => void;
  removeSpouse: (index: number) => void;
  addStory: (story: ProfileData["stories"][0]) => void;
  removeStory: (id: string) => void;
  submitProfile: () => Promise<void>;
  saveDraft: () => Promise<void>;
  registerAndSubmit: () => Promise<void>;
  loadProfile: () => Promise<void>;
  resetProfile: () => void;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  isLoading: boolean;
}
