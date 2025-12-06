export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar: string | null;
}

export interface ProfileTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: UserProfileData;
  onProfileUpdate: (profile: UserProfileData) => void;
}

export interface ProfileInfoProps {
  profile: UserProfileData;
  onProfileUpdate: (profile: UserProfileData) => void;
}

export interface AvatarUploadProps {
  avatar: string | null;
  onAvatarChange: (avatar: File | null) => void;
}

export interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onProfileUpdate: (profile: UserProfileData) => void;
}